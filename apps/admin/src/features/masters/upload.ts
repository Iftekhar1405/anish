import * as ImagePicker from "expo-image-picker";
import { mastersApi } from "./api";

export interface UploadedImage {
  imageUrl: string;
  imagePublicId: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  error?: { message: string };
}

/** A stalled upload should fail with a message, not hang the dialog forever. */
const UPLOAD_TIMEOUT_MS = 60_000;

/**
 * POSTs a multipart form over `XMLHttpRequest` rather than `fetch`.
 *
 * This is deliberate — please don't "modernise" it back to `fetch`. Expo SDK 57
 * replaces the global `fetch` with its own WinterCG implementation (see
 * `expo/src/winter/runtime.native.ts`), and that encoder accepts a form part
 * only as a string, a real `Blob`, or an object exposing `bytes()`. React
 * Native's local-file part — `{ uri, name, type }`, which is the only shape an
 * image-picker result can give us — matches none of those, so it throws
 * `Unsupported FormDataPart implementation` before a single byte is sent.
 *
 * This is not an upstream bug that a future SDK will fix: Expo has a test named
 * "should throw an error if the react-native FormData passing an uri" asserting
 * exactly that rejection, even though their own `ExpoFormData` types declare the
 * `{ uri }` part as supported. Don't wait for it to start working.
 *
 * React Native's XHR still passes that part to the native networking layer,
 * which streams the file straight off disk. So this path both works and avoids
 * loading a multi-megabyte photo into JS memory, which matters on the low-end
 * Android phones this app runs on.
 */
function postFormData(
  url: string,
  form: FormData,
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.onload = () => {
      let parsed: CloudinaryUploadResponse;
      try {
        parsed = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
      } catch {
        reject(
          new Error(
            `Image upload failed (${xhr.status}) — the image server sent an unreadable response.`,
          ),
        );
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300 || parsed.error) {
        // Cloudinary explains rejections (file too large, bad signature) in the
        // body, so prefer its wording over a bare status code.
        reject(
          new Error(parsed.error?.message ?? `Image upload failed (${xhr.status}).`),
        );
        return;
      }
      resolve(parsed);
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "Could not reach the image server. Check your connection and try again.",
        ),
      );
    xhr.ontimeout = () =>
      reject(
        new Error("The image upload timed out. Try again on a better connection."),
      );

    xhr.send(form);
  });
}

/**
 * Backend-signed direct upload: the device asks the server for a signature,
 * then uploads the file straight to Cloudinary. The API secret never ships to
 * the client. Returns null if the user cancels the picker.
 */
export async function pickAndUploadImage(
  folder = "sires",
): Promise<UploadedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Photo library permission is required to add an image.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: true,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const sig = await mastersApi.signUpload(folder);
  const filename = asset.fileName ?? `upload-${sig.timestamp}.jpg`;

  const form = new FormData();
  // On web the picker hands back a real `File`, which FormData encodes natively.
  // On native there is no File — only a path — so we use React Native's
  // local-file part, which the XHR layer streams off disk (see postFormData).
  form.append(
    "file",
    asset.file ??
      ({
        uri: asset.uri,
        name: filename,
        type: asset.mimeType ?? "image/jpeg",
      } as unknown as Blob),
    filename,
  );
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const data = await postFormData(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    form,
  );
  return { imageUrl: data.secure_url, imagePublicId: data.public_id };
}
