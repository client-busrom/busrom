export interface UploadProgressEvent {
  percent: number;
  loaded: number;
  total: number;
}

export interface UploadOptions {
  url: string;
  file: File;
  fieldName?: string;
  additionalData?: Record<string, string>;
  onProgress?: (event: UploadProgressEvent) => void;
}

export const uploadFileWithProgress = <T = any>(options: UploadOptions): Promise<T> => {
  const { url, file, fieldName = "file", additionalData = {}, onProgress } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append(fieldName, file);
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress({ percent, loaded: event.loaded, total: event.total });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          resolve(xhr.responseText as any);
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    
    xhr.open("POST", url);
    xhr.send(formData);
  });
};
