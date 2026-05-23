// lib/uploadToCloudinary.js
export async function uploadToCloudinary(file, folder = 'marhaba-listings') {
  const signRes = await fetch(`/api/upload?folder=${folder}`, {
    credentials: 'include',
  });
  if (!signRes.ok) throw new Error('Failed to get upload signature');
  const { timestamp, signature, cloudName, apiKey, folder: signedFolder } = await signRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', signedFolder);
  formData.append('api_key', apiKey);
  // Force conversion to JPEG on upload — fixes HEIC/HEIF display everywhere
  formData.append('format', 'jpg');
  formData.append('transformation', 'q_auto:good');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Cloudinary error: ${text.slice(0, 120)}`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
  if (!data.secure_url) throw new Error('No URL returned');

  return { url: data.secure_url, public_id: data.public_id };
}