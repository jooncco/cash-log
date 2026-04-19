import { apiClient, APIError } from '../lib/api/client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

describe('APIClient', () => {
  it('GET returns parsed JSON', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ id: 1 }) });
    const result = await apiClient.get('/api/test');
    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'GET' }));
  });

  it('POST sends JSON body', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 201, json: () => Promise.resolve({ id: 2 }) });
    await apiClient.post('/api/test', { name: 'foo' });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ method: 'POST', body: '{"name":"foo"}' }),
    );
  });

  it('throws APIError on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    await expect(apiClient.get('/api/missing')).rejects.toThrow(APIError);
    await expect(apiClient.get('/api/missing')).rejects.toMatchObject({ status: 404 });
  });

  it('returns null for 204 No Content', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204 });
    const result = await apiClient.delete('/api/test/1');
    expect(result).toBeNull();
  });

  it('download returns blob', async () => {
    const blob = new Blob(['data']);
    mockFetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) });
    const result = await apiClient.download('/api/export/csv');
    expect(result).toBe(blob);
  });
});
