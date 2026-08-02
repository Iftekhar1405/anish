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

  const form = new FormData();
  form.append("file", {
    uri: asset.uri,
    name: asset.fileName ?? `upload-${sig.timestamp}.jpg`,
    type: asset.mimeType ?? "image/jpeg",
  } as unknown as Blob);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  const data = (await response.json()) as CloudinaryUploadResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? "Image upload failed.");
  }
  return { imageUrl: data.secure_url, imagePublicId: data.public_id };
}
