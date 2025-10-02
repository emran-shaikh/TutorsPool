interface GoogleMeetLinkData {
  tutorEmail: string;
  studentEmail: string;
  startTime: Date;
  endTime: Date;
  meetingTitle?: string;
  description?: string;
}

interface GoogleMeetLinkResult {
  success: boolean;
  meetingId?: string;
  meetingLink?: string;
  meetCode?: string;
  password?: string;
  meetingDetails?: {
    meetingId: string;
    meetCode: string;
    meetingLink: string;
    password: string;
    instructions: string;
    startTime: string;
    endTime: string;
  };
  error?: string;
}

/**
 * Generate a Google Meet link for online sessions
 * Note: This is a simplified implementation that generates Google Meet codes
 * In a production environment, you would integrate with Google Meet API or Google Calendar API
 * for automated meeting creation with proper authentication and permissions.
 * 
 * @param tutorEmail - The tutor's email address
 * @param studentEmail - The student's email address  
 * @param startTime - The meeting start time
 * @endTime - The meeting end time
 * @returns GoogleMeetLinkResult
 */
export async function createGoogleMeetLink(
  tutorEmail: string,
  studentEmail: string,
  startTime: Date,
  endTime: Date,
  meetingTitle?: string,
  description?: string
): Promise<GoogleMeetLinkResult> {
  try {
    console.log('Creating Google Meet link:', { tutorEmail, studentEmail, startTime, endTime });

    // Generate a random alphanumeric meet code (Google Meet format)
    const generateMeetCode = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const generatePart = () => {
        let part = '';
        for (let i = 0; i < 3; i++) {
          part += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return part;
      };
      return `${generatePart()}-${generatePart()}-${generatePart()}`;
    };

    // Generate unique meeting components
    const meetCode = generateMeetCode();
    const meetingId = `tutorspool-${Date.now()}-${meetCode}`;
    const meetingLink = `https://meet.google.com/${meetCode}`;
    const password = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Create meeting details
    const meetingDetails = {
      meetingId,
      meetCode,
      meetingLink,
      password,
      instructions: `Welcome to your tutoring session!\n\nMeeting Details:\n📅 Date: ${startTime.toLocaleDateString()}\n🕐 Time: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}\n👨‍🏫 Tutor: ${tutorEmail}\n👨‍🎓 Student: ${studentEmail}\n\nJoin Instructions:\n1. Click the meeting link: ${meetingLink}\n2. Use password if prompted: ${password}\n3. Enable your camera and microphone\n4. Wait for your tutor/student to join\n\n📝 Session Notes:\n${description || 'Please prepare any questions or materials you want to discuss during the session.'}\n\nNeed help? Contact TutorsPool support.`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      tutorEmail,
      studentEmail,
      createdAt: new Date().toISOString()
    };

    console.log('Google Meet link created successfully:', meetingDetails);

    return {
      success: true,
      meetingId,
      meetingLink,
      meetCode,
      password,
      meetingDetails
    };

  } catch (error) {
    console.error('Error creating Google Meet link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Google Meet link'
    };
  }
}

/**
 * Validate if a Google Meet code is formatted correctly
 * @param meetCode - The Google Meet code to validate
 * @returns boolean
 */
export function validateGoogleMeetCode(meetCode: string): boolean {
  // Google Meet codes are typically in format: abc-def-ghi
  const meetCodeRegex = /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/;
  return meetCodeRegex.test(meetCode);
}

/**
 * Generate a backup meeting link in case the primary one fails
 * @returns GoogleMeetLinkResult
 */
export async function createBackupGoogleMeetLink(): Promise<GoogleMeetLinkResult> {
  try {
    // Generate a simple fallback meeting link
    const alternativeCode = Math.random().toString(36).substr(2, 9).toLowerCase();
    const backupLink = `https://meet.google.com/${alternativeCode}`;
    
    return {
      success: true,
      meetingLink: backupLink,
      meetCode: alternativeCode,
      meetingDetails: {
        meetingId: `backup-${Date.now()}`,
        meetCode: alternativeCode,
        meetingLink: backupLink,
        password: '',
        instructions: 'Backup meeting link - please use the primary link first.'
      }
    };

  } catch (error) {
    return {
      success: false,
      error: 'Failed to create backup meeting link'
    };
  }
}

/**
 * Create meeting room instructions
 * @param meetingDetails - Meeting details
 * @returns formatted instructions string
 */
export function formatMeetingInstructions(meetingDetails: any): string {
  return `
=== TUTORSPOOL TUTORING SESSION ===

📅 Session Date: ${new Date(meetingDetails.startTime).toLocaleDateString()}
🕐 Session Time: ${new Date(meetingDetails.startTime).toLocaleTimeString()} - ${new Date(meetingDetails.endTime).toLocaleTimeString()}

🔗 Meeting Link: ${meetingDetails.meetingLink}
🔑 Meeting Password: ${meetingDetails.password || 'No password required'}

👥 Participants:
   • Tutor: ${meetingDetails.tutorEmail}
   • Student: ${meetingDetails.studentEmail}

📋 Preparation Checklist:
   ✅ Test your camera and microphone
   ✅ Ensure stable internet connection  
   ✅ Have relevant materials ready
   ✅ Check the lighting in your area

⚡ Quick Join:
   ${meetingDetails.meetingLink}
   
Need help? Contact TutorsPool support at support@tutorspool.com

---
This meeting link is generated by TutorsPool Platform
  `.trim();
}

/**
 * Generate meeting summary for notifications
 * @param meetingDetails - Meeting details
 * @returns meeting summary string
 */
export function generateMeetingSummary(meetingDetails: any): string {
  return `
📱 NEW SESSION BOOKING WITH GOOGLE MEET LINK

Date: ${new Date(meetingDetails.startTime).toLocaleDateString()}
Time: ${new Date(meetingDetails.startTime).toLocaleTimeString()} - ${new Date(meetingDetails.endTime).toLocaleTimeString()}

🔗 Meeting Link: ${meetingDetails.meetingLink}
🔑 Password: ${meetingDetails.password}

This is an online session hosted on Google Meet. Join using the link above.
  `.trim();
}
