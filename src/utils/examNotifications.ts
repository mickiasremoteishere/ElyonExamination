import { sendNotification } from './onesignal';
import { toast } from 'sonner';

// Notification for when a new exam is available
export const notifyExamAvailable = async (examName: string, examId: string) => {
  try {
    await sendNotification(
      `New exam available: ${examName}. Click to start your exam.`,
      `/exam/${examId}`
    );
    console.log(`Notification sent for new exam: ${examName}`);
  } catch (error) {
    console.error('Error sending exam available notification:', error);
    throw error;
  }
};

// Notification for when exam results are published
export const notifyResultsPublished = async (examName: string, resultId: string) => {
  try {
    await sendNotification(
      `Results for ${examName} have been published! Click to view your results.`,
      `/results/${resultId}`
    );
    toast.success(`Results for "${examName}" have been published successfully!`);
    console.log(`Results published notification sent for exam: ${examName}`);
  } catch (error) {
    console.error('Error notifying about published results:', error);
    toast.error('Failed to send result publication notifications');
    throw error;
  }
};  // <-- This closing brace was missing

// Notification for upcoming exam reminders
export const notifyUpcomingExam = async (examName: string, examDate: Date, examId: string) => {
  const now = new Date();
  const timeDiff = examDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysLeft > 0) {
    try {
      await sendNotification(
        `Reminder: ${examName} is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Prepare now!`,
        `/exam/${examId}`
      );
      console.log(`Upcoming exam reminder sent for: ${examName}`);
    } catch (error) {
      console.error('Error sending upcoming exam notification:', error);
      throw error;
    }
  }
};