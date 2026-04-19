import { downloadBlob } from '../lib/download';

describe('downloadBlob', () => {
  it('creates anchor element and triggers download', () => {
    const revokeURL = jest.fn();
    const createURL = jest.fn(() => 'blob:test');
    global.URL.createObjectURL = createURL;
    global.URL.revokeObjectURL = revokeURL;

    const click = jest.fn();
    const appendChild = jest.fn();
    const removeChild = jest.fn();
    jest.spyOn(document, 'createElement').mockReturnValue({ click, set href(_: string) {}, set download(_: string) {} } as unknown as HTMLAnchorElement);
    jest.spyOn(document.body, 'appendChild').mockImplementation(appendChild);
    jest.spyOn(document.body, 'removeChild').mockImplementation(removeChild);

    downloadBlob(new Blob(['test']), 'file.csv');

    expect(createURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeURL).toHaveBeenCalledWith('blob:test');
  });
});
