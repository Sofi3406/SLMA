const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchGalleries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/galleries?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch galleries');
  return res.json();
}

export async function fetchGallery(id) {
  const res = await fetch(`${API_BASE}/galleries/${id}`);
  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
}

export async function createGallery(formData, token) {
  const res = await fetch(`${API_BASE}/galleries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return res.json();
}

export async function updateGallery(id, data, token, isForm = false) {
  const res = await fetch(`${API_BASE}/galleries/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isForm ? {} : { 'Content-Type': 'application/json' })
    },
    body: isForm ? data : JSON.stringify(data),
  });
  return res.json();
}

export async function deleteGallery(id, token) {
  const res = await fetch(`${API_BASE}/galleries/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export default { fetchGalleries, fetchGallery, createGallery, updateGallery, deleteGallery };
