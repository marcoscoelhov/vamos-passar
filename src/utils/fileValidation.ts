
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_EXTENSIONS = ['.docx', '.pdf'];

export const validateFile = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não suportado. Use: ${SUPPORTED_EXTENSIONS.join(', ')}`
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  const mb = bytes / 1024 / 1024;
  return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
};

export const getSupportedFormats = () => {
  return [
    { extension: '.docx', description: 'Documentos do Microsoft Word', status: 'Suportado' },
    { extension: '.pdf', description: 'Documentos PDF', status: 'Suportado' }
  ];
};
