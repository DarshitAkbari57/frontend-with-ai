export async function deleteActivity(id: string): Promise<void> {
  const response = await fetch(`/api/activities/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete activity');
  }
}

export async function updateActivity(
  id: string,
  data: { isDisabled: boolean }
): Promise<void> {
  const response = await fetch(`/api/activities/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update activity');
  }
}