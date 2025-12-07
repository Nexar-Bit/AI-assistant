import axiosClient from "./axiosClient";

/**
 * Download PDF for a consultation
 * @param consultationId - The consultation ID
 * @returns Blob data for the PDF file
 */
export async function downloadConsultationPDF(consultationId: string): Promise<Blob> {
  const response = await axiosClient.get(
    `/api/v1/reports/consultations/${consultationId}/download`,
    {
      responseType: "blob", // Important: tells axios to handle binary data
    }
  );
  return response.data;
}

/**
 * Generate PDF for a consultation (without downloading)
 * @param consultationId - The consultation ID
 */
export async function generateConsultationPDF(consultationId: string): Promise<any> {
  const { data } = await axiosClient.post(
    `/api/v1/reports/consultations/${consultationId}`
  );
  return data;
}

/**
 * Helper function to trigger PDF download in browser
 * @param blob - The PDF blob data
 * @param filename - The filename for the downloaded file
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Download PDF for a consultation (complete function)
 * @param consultationId - The consultation ID
 * @param filename - Optional custom filename (defaults to consultation-{license_plate}.pdf)
 */
export async function downloadPDF(consultationId: string, filename?: string): Promise<void> {
  try {
    const blob = await downloadConsultationPDF(consultationId);
    const defaultFilename = filename || `consultation-${consultationId}.pdf`;
    downloadPDFBlob(blob, defaultFilename);
  } catch (error: any) {
    console.error("Failed to download PDF:", error);
    throw new Error(error.response?.data?.detail || "Failed to download PDF");
  }
}

/**
 * Download PDF for a chat thread
 * @param threadId - The chat thread ID
 * @returns Blob data for the PDF file
 */
export async function downloadChatThreadPDF(threadId: string): Promise<Blob> {
  const response = await axiosClient.get(
    `/api/v1/reports/chat-threads/${threadId}/download`,
    {
      responseType: "blob",
    }
  );
  return response.data;
}

/**
 * Download PDF for a chat thread (complete function)
 * @param threadId - The chat thread ID
 * @param licensePlate - The license plate for filename
 * @param filename - Optional custom filename
 */
export async function downloadChatThreadPDFFile(
  threadId: string,
  licensePlate?: string,
  filename?: string
): Promise<void> {
  try {
    const blob = await downloadChatThreadPDF(threadId);
    const dateStr = new Date().toISOString().split("T")[0];
    const defaultFilename = filename || `diagnostic-report-${licensePlate || threadId}-${dateStr}.pdf`;
    downloadPDFBlob(blob, defaultFilename);
  } catch (error: any) {
    console.error("Failed to download chat thread PDF:", error);
    throw new Error(error.response?.data?.detail || "Failed to download PDF");
  }
}

