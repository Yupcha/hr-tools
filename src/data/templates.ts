// Template tool registry — letters, HR emails & payroll documents.
// Ported from the yupcha.com HR Toolkit, kept as pure data so new templates
// are just new entries. Each tool fills [Placeholders] inside three tone variants.

export type TemplateTab =
  | "generate-letters"
  | "email-templates"
  | "payroll";

export interface TemplateMeta {
  title: string;
  category: string;
  tab: TemplateTab;
  placeholders: string[];
  templates: {
    formal: string;
    modern: string;
    friendly: string;
  };
}

export const templateRegistry: Record<string, TemplateMeta> = {
  /* ── Recruitment & Hiring ── */
  "offer-letter": {
    title: "Offer Letter",
    category: "Recruitment & Hiring Letters",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Organization Address Line 1", "Organization Address Line 2", "Date", "Employee Name", "Job Title", "Annual CTC", "Manager Name", "Joining Date", "Last Date of Acceptance", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              [Organization Address Line 1]\n                                                                              [Organization Address Line 2]\n\n                                                                              [Date]\n\n                                        Offer Letter\n\nDear [Employee Name],\n\nCongratulations! We are pleased to confirm that you have been selected to work for [Organization Name]. We are delighted to make you the following job offer.\n\nThe position we are offering you is that of [Job Title] with an annual cost to company of [Annual CTC]. This position reports to [Manager Name] Manager.\n\nWe would like you to start work on [Joining Date]. Please report to [Manager Name] Manager for documentation and orientation. If this date is not acceptable, please contact me immediately.\n\nPlease sign the enclosed copy of this letter and return it to me by [Last Date of Acceptance] to indicate your acceptance of this offer.\n\nWe are confident you will be able to make a significant contribution to the success of [Organization Name] and look forward to working with you.\n\nSincerely,\n\n\n[HR Name]\n[Organization Name]\n\n\nAccepted by,\n\n\n[Employee Name]`,
      modern: `[Organization Name]\n[Organization Address Line 1] | [Organization Address Line 2]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[Date]\n\nOFFER OF EMPLOYMENT\n\nHi [Employee Name],\n\nWe're thrilled to extend this offer to you! After a thorough selection process, we're confident that you are the right person to join [Organization Name].\n\nHere are the details:\n\n    ● Position: [Job Title]\n    ● Compensation: [Annual CTC] per annum\n    ● Reports to: [Manager Name]\n    ● Start Date: [Joining Date]\n\nPlease confirm your acceptance by [Last Date of Acceptance] by signing and returning this letter.\n\nWe believe you'll make an incredible impact at [Organization Name], and we can't wait to have you on board!\n\nBest regards,\n\n[HR Name]\nPeople & Culture Team\n[Organization Name]\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAcceptance: I, [Employee Name], accept the above offer of employment.\n\nSignature: ___________________________    Date: _______________`,
      friendly: `Hey [Employee Name]!\n\nGreat news from [Organization Name]!\n\nYou've been selected for the role of [Job Title] — and we couldn't be more excited!\n\nHere's a quick snapshot of your offer:\n\n    Company: [Organization Name]\n    Role: [Job Title]\n    Package: [Annual CTC]\n    You'll report to: [Manager Name]\n    Start date: [Joining Date]\n\nWe'd love for you to confirm by [Last Date of Acceptance] so we can get everything set up for your first day.\n\nIf you have any questions at all, don't hesitate to reach out!\n\nWelcome aboard!\n\nWarm regards,\n[HR Name]\n[Organization Name]\n[Organization Address Line 1], [Organization Address Line 2]\n\n───────────────────────────────────\n\nTo accept, just sign below:\n\nName: [Employee Name]\nDate: [Date]\nSignature: ___________________________`,
    },
  },
  "conditional-offer-letter": {
    title: "Conditional Offer Letter",
    category: "Recruitment & Hiring Letters",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Organization Address Line 1", "Organization Address Line 2", "Date", "Candidate Name", "Job Title", "Annual CTC", "Conditions", "Condition Deadline", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              [Organization Address Line 1]\n                                                                              [Organization Address Line 2]\n\n                                                                              [Date]\n\n                                  Conditional Offer Letter\n\nDear [Candidate Name],\n\nWe are pleased to extend a conditional offer of employment for the position of [Job Title] at [Organization Name], with an annual compensation of [Annual CTC].\n\nThis offer is contingent upon the successful completion of the following conditions:\n\n[Conditions]\n\nAll conditions must be satisfied by [Condition Deadline]. Failure to meet these conditions may result in the withdrawal of this offer.\n\nUpon successful completion, we will issue your formal appointment letter with further details regarding your start date and onboarding process.\n\nWe look forward to welcoming you to [Organization Name].\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name]\n[Organization Address Line 1] | [Organization Address Line 2]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[Date]\n\nCONDITIONAL OFFER — [Job Title]\n\nDear [Candidate Name],\n\nWe're excited to extend a conditional offer for the [Job Title] position at [Organization Name]!\n\n    ● Package: [Annual CTC] per annum\n\nThis offer is subject to:\n[Conditions]\n\n      Deadline: [Condition Deadline]\n\nOnce cleared, we'll finalize your onboarding details.\n\nBest,\n[HR Name] | [Organization Name]`,
      friendly: `Hi [Candidate Name]! \n\nExciting update from [Organization Name]!\n\nWe'd love to bring you on as our [Job Title] (package: [Annual CTC])! There are just a few things we need to wrap up first:\n\n[Conditions]\n\nPlease complete these by [Condition Deadline], and we'll get you all set up.\n\nQuestions? Just reach out!\n\nCheers,\n[HR Name]\n[Organization Name]`,
    },
  },
  "intent-to-hire-letter": {
    title: "Intent to Hire Letter",
    category: "Recruitment & Hiring Letters",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Organization Address Line 1", "Date", "Candidate Name", "Job Title", "Salary Range", "Expected Start Date", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              [Organization Address Line 1]\n\n                                                                              [Date]\n\n                                    Intent to Hire Letter\n\nDear [Candidate Name],\n\nThis letter is to express the intent of [Organization Name] to offer you employment in the role of [Job Title].\n\nWhile this letter is non-binding and does not constitute a formal offer of employment, we are actively working to finalize the terms of your offer, which we anticipate will include a compensation in the range of [Salary Range].\n\nWe expect to formalize this offer shortly, with an anticipated start date of [Expected Start Date].\n\nPlease note that this letter does not create any obligation on either party until a formal offer letter is issued and accepted.\n\nSincerely,\n\n[HR Name]\n[Organization Name]`,
      modern: `[Organization Name] | [Organization Address Line 1]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nINTENT TO HIRE\n\nDear [Candidate Name],\n\nWe intend to bring you on board as [Job Title] at [Organization Name].\n\n    ● Expected Salary: [Salary Range]\n    ● Target Start: [Expected Start Date]\n\nA formal offer is being prepared. This letter is non-binding.\n\nBest regards,\n[HR Name]`,
      friendly: `Hi [Candidate Name]! \n\nGreat news — [Organization Name] plans to offer you the [Job Title] role!\n\nWe're finalizing details (expected package: [Salary Range], start: [Expected Start Date]).\n\nA formal offer is on its way soon. Stay tuned!\n\nWarm regards,\n[HR Name]`,
    },
  },
  "interview-call-letter": {
    title: "Interview Call Letter",
    category: "Recruitment & Hiring Letters",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Organization Address Line 1", "Date", "Candidate Name", "Job Title", "Interview Date", "Interview Time", "Venue", "Interviewer Name", "Preparation Notes", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              [Organization Address Line 1]\n\n                                                                              [Date]\n\n                                  Interview Call Letter\n\nDear [Candidate Name],\n\nThank you for your interest in the [Job Title] position at [Organization Name]. We are pleased to invite you for an interview.\n\nInterview Details:\n    Date: [Interview Date]\n    Time: [Interview Time]\n    Venue: [Venue]\n    Interviewer: [Interviewer Name]\n\nPlease note: [Preparation Notes]\n\nKindly confirm your availability by replying to this letter at the earliest.\n\nWe look forward to meeting you.\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name] | [Organization Address Line 1]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nINTERVIEW INVITATION — [Job Title]\n\nHi [Candidate Name],\n\nYou've been shortlisted! Here are your interview details:\n\n      [Interview Date] at [Interview Time]\n    📍  [Venue]\n      With: [Interviewer Name]\n\nPrep tips: [Preparation Notes]\n\nPlease confirm your attendance. Best of luck!\n\n[HR Name] | [Organization Name]`,
      friendly: `Hey [Candidate Name]! \n\nYou're invited for an interview at [Organization Name] for the [Job Title] role!\n\n     When: [Interview Date], [Interview Time]\n    📍 Where: [Venue]\n     With: [Interviewer Name]\n\nQuick tip: [Preparation Notes]\n\nLet us know if this works for you!\n\nCheers,\n[HR Name]`,
    },
  },
  "appointment-letter": {
    title: "Appointment Letter",
    category: "Employment & Onboarding",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Organization Address Line 1", "Date", "Employee Name", "Job Title", "Department", "Joining Date", "Salary", "Reporting Manager", "Terms and Conditions", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              [Organization Address Line 1]\n\n                                                                              [Date]\n\n                                    Appointment Letter\n\nDear [Employee Name],\n\nWe are pleased to appoint you as [Job Title] in the [Department] department at [Organization Name], effective [Joining Date].\n\nYour compensation will be [Salary] per annum. You will report to [Reporting Manager].\n\nTerms & Conditions:\n[Terms and Conditions]\n\nPlease sign and return a copy of this letter to confirm your acceptance.\n\nWelcome to [Organization Name]!\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name] | [Organization Address Line 1]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nAPPOINTMENT CONFIRMATION\n\nDear [Employee Name],\n\nWelcome aboard! Here are your appointment details:\n\n    ● Role: [Job Title]\n    ● Department: [Department]\n    ● Start: [Joining Date]\n    ● Compensation: [Salary]\n    ● Reports to: [Reporting Manager]\n\nTerms:\n[Terms and Conditions]\n\nBest,\n[HR Name] | [Organization Name]`,
      friendly: `Hi [Employee Name]! \n\nIt's official — you're now part of [Organization Name]!\n\n     Role: [Job Title] ([Department])\n     Starting: [Joining Date]\n     Package: [Salary]\n     Manager: [Reporting Manager]\n\nA few things to note:\n[Terms and Conditions]\n\nCan't wait to work with you!\n\nCheers,\n[HR Name]`,
    },
  },
  "welcome-letter": {
    title: "Welcome Letter",
    category: "Employment & Onboarding",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Date", "Employee Name", "Job Title", "Team Name", "Joining Date", "Manager Name", "First Day Instructions", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n\n                                                                              [Date]\n\n                                       Welcome Letter\n\nDear [Employee Name],\n\nWelcome to [Organization Name]! We are delighted to have you join our team as [Job Title] in the [Team Name] team.\n\nYour first day is [Joining Date]. You will report to [Manager Name].\n\nFirst Day Information:\n[First Day Instructions]\n\nWe are excited to have you on board and look forward to a successful journey together.\n\nWarm regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nWELCOME TO THE TEAM!\n\nHi [Employee Name],\n\nWe're thrilled you're joining as [Job Title] in [Team Name]!\n\n     First day: [Joining Date]\n     Manager: [Manager Name]\n\nHere's what to expect:\n[First Day Instructions]\n\nSee you soon!\n[HR Name] | [Organization Name]`,
      friendly: `Hey [Employee Name]! \n\nWELCOME TO [Organization Name]! \n\nWe're so excited you're joining as [Job Title] on the [Team Name] team!\n\nYour first day is [Joining Date] — here's what you need to know:\n[First Day Instructions]\n\nYour manager [Manager Name] will be there to help you settle in.\n\nSee you soon! \n\n[HR Name]`,
    },
  },
  "probation-confirmation": {
    title: "Probation Confirmation",
    category: "Employment & Onboarding",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Date", "Employee Name", "Job Title", "Probation End Date", "Confirmation Date", "Revised Salary", "Remarks", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n\n                                                                              [Date]\n\n                                 Probation Confirmation Letter\n\nDear [Employee Name],\n\nWe are pleased to confirm that you have successfully completed your probation period as [Job Title] at [Organization Name].\n\nYour probation ended on [Probation End Date], and you are hereby confirmed as a permanent employee effective [Confirmation Date].\n\nRevised compensation: [Revised Salary]\n\nRemarks: [Remarks]\n\nCongratulations on this milestone!\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nPROBATION COMPLETED \n\nDear [Employee Name],\n\nGreat news — your probation as [Job Title] is complete!\n\n    ● Probation ended: [Probation End Date]\n    ● Confirmed from: [Confirmation Date]\n    ● Revised salary: [Revised Salary]\n\n[Remarks]\n\nCongrats!\n[HR Name] | [Organization Name]`,
      friendly: `Hi [Employee Name]! \n\nCongratulations!! You've successfully cleared your probation as [Job Title]!\n\nYou're now a permanent member of [Organization Name] (effective [Confirmation Date])!\n\nUpdated package: [Revised Salary]\n\n[Remarks]\n\nKeep up the amazing work! \n\n[HR Name]`,
    },
  },
  "employment-verification": {
    title: "Employment Verification",
    category: "Employment & Onboarding",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Organization Address Line 1", "Date", "Employee Name", "Job Title", "Employment Start Date", "Employment End Date", "Current Status", "Requested By", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              [Organization Address Line 1]\n\n                                                                              [Date]\n\n                           Employment Verification Letter\n\nTo Whom It May Concern,\n\nThis letter serves to verify that [Employee Name] has been employed at [Organization Name] as [Job Title].\n\nEmployment Details:\n    Start Date: [Employment Start Date]\n    End Date: [Employment End Date]\n    Status: [Current Status]\n\nThis letter is issued upon request for the purpose of: [Requested By]\n\nThis letter is issued without prejudice and does not constitute any recommendation.\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name] | [Organization Address Line 1]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nEMPLOYMENT VERIFICATION\n\nThis confirms that [Employee Name] is/was employed at [Organization Name].\n\n    ● Role: [Job Title]\n    ● From: [Employment Start Date]\n    ● To: [Employment End Date]\n    ● Status: [Current Status]\n\nPurpose: [Requested By]\n\n[HR Name] | [Organization Name]`,
      friendly: `To Whom It May Concern,\n\nThis is to confirm that [Employee Name] works/worked with us at [Organization Name] as [Job Title] from [Employment Start Date] to [Employment End Date].\n\nCurrent status: [Current Status]\n\nThis letter was requested for: [Requested By]\n\nHappy to verify further details if needed!\n\n[HR Name]\n[Organization Name]\n[Date]`,
    },
  },
  "resignation-acceptance": {
    title: "Resignation Acceptance",
    category: "Separation & Exit",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Date", "Employee Name", "Job Title", "Resignation Date", "Last Working Day", "Notice Period", "Remarks", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n\n                                                                              [Date]\n\n                               Resignation Acceptance Letter\n\nDear [Employee Name],\n\nThis letter acknowledges receipt and acceptance of your resignation from the position of [Job Title] at [Organization Name], submitted on [Resignation Date].\n\nYour last working day will be [Last Working Day], in accordance with the [Notice Period] notice period.\n\n[Remarks]\n\nWe wish you all the best in your future endeavors.\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nRESIGNATION ACCEPTED\n\nDear [Employee Name],\n\nYour resignation as [Job Title] (submitted [Resignation Date]) has been accepted.\n\n    ● Last day: [Last Working Day]\n    ● Notice: [Notice Period]\n\n[Remarks]\n\nAll the best!\n[HR Name] | [Organization Name]`,
      friendly: `Hi [Employee Name],\n\nWe've received and accepted your resignation as [Job Title].\n\nYour last day will be [Last Working Day].\n\n[Remarks]\n\nThank you for everything — you'll be missed! Wishing you the very best. \n\n[HR Name]\n[Organization Name]`,
    },
  },
  "termination-letter": {
    title: "Termination Letter",
    category: "Separation & Exit",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Date", "Employee Name", "Job Title", "Termination Date", "Reason", "Settlement Details", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n\n                                                                              [Date]\n\n                                    Termination Letter\n\nDear [Employee Name],\n\nThis letter serves as formal notification that your employment with [Organization Name] as [Job Title] is terminated effective [Termination Date].\n\nReason: [Reason]\n\nFinal Settlement: [Settlement Details]\n\nPlease return all company property before your last day. For questions regarding your final settlement, contact the HR department.\n\nRegards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nNOTICE OF TERMINATION\n\nDear [Employee Name],\n\nYour employment as [Job Title] at [Organization Name] will end on [Termination Date].\n\nReason: [Reason]\n\nSettlement: [Settlement Details]\n\nPlease coordinate property return with HR.\n\n[HR Name] | [Organization Name]`,
      friendly: `Dear [Employee Name],\n\nWe regret to inform you that your position as [Job Title] at [Organization Name] has been terminated, effective [Termination Date].\n\nReason: [Reason]\n\nRegarding your final settlement: [Settlement Details]\n\nPlease connect with HR for any questions or to arrange return of company assets.\n\n[HR Name]\n[Organization Name]\n[Date]`,
    },
  },
  "experience-letter": {
    title: "Experience Letter",
    category: "Separation & Exit",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Organization Address Line 1", "Date", "Employee Name", "Job Title", "Start Date", "End Date", "Responsibilities", "Performance Remarks", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              [Organization Address Line 1]\n\n                                                                              [Date]\n\n                                    Experience Letter\n\nTo Whom It May Concern,\n\nThis is to certify that [Employee Name] was employed at [Organization Name] as [Job Title] from [Start Date] to [End Date].\n\nDuring this tenure, their key responsibilities included:\n[Responsibilities]\n\nPerformance: [Performance Remarks]\n\nWe wish [Employee Name] all the best in future endeavors.\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name] | [Organization Address Line 1]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nEXPERIENCE CERTIFICATE\n\nThis certifies that [Employee Name] served as [Job Title] at [Organization Name] from [Start Date] to [End Date].\n\nResponsibilities: [Responsibilities]\n\nPerformance: [Performance Remarks]\n\nBest wishes!\n[HR Name] | [Organization Name]`,
      friendly: `To Whom It May Concern,\n\n[Employee Name] was a valued member of [Organization Name] as [Job Title] from [Start Date] to [End Date].\n\nWhat they did: [Responsibilities]\n\nHow they did it: [Performance Remarks]\n\nWe highly recommend [Employee Name] and wish them continued success! \n\nWarmly,\n[HR Name]\n[Organization Name]`,
    },
  },
  "relieving-letter": {
    title: "Relieving Letter",
    category: "Separation & Exit",
    tab: "generate-letters",
    placeholders: ["Organization Name", "Date", "Employee Name", "Job Title", "Last Working Day", "Relieving Date", "Dues Status", "Remarks", "HR Name"],
    templates: {
      formal: `                                                                              [Organization Name]\n\n                                                                              [Date]\n\n                                    Relieving Letter\n\nDear [Employee Name],\n\nThis is to confirm that you have been relieved from your position as [Job Title] at [Organization Name], effective [Relieving Date].\n\nYour last working day was [Last Working Day].\n\nDues: [Dues Status]\n\n[Remarks]\n\nWe wish you success in your future endeavors.\n\nSincerely,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `[Organization Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Date]\n\nRELIEVING CERTIFICATE\n\nDear [Employee Name],\n\nYou are officially relieved from [Job Title] at [Organization Name] as of [Relieving Date].\n\n    ● Last day: [Last Working Day]\n    ● Dues: [Dues Status]\n\n[Remarks]\n\nAll the best!\n[HR Name] | [Organization Name]`,
      friendly: `Hi [Employee Name],\n\nThis confirms you've been officially relieved from your role as [Job Title] at [Organization Name] as of [Relieving Date].\n\nDues Status: [Dues Status]\n\n[Remarks]\n\nThank you for your contributions — wishing you the best ahead! \n\n[HR Name]\n[Organization Name]`,
    },
  },

  "interview-scheduling": {
    title: "Interview Scheduling",
    category: "Recruitment Emails",
    tab: "email-templates",
    placeholders: ["Candidate Name", "Position", "Organization Name", "Interview Date", "Interview Type", "Interviewer Name", "Interviewer Title", "Location or Link", "HR Name"],
    templates: {
      formal: `Subject: Interview Invitation: [Position] at [Organization Name]\n\nDear [Candidate Name],\n\nThank you for your interest in the [Position] role at [Organization Name]. After reviewing your application, we are pleased to invite you for an interview to discuss this opportunity further.\n\nInterview Details:\n    ● Role: [Position]\n    ● Date & Time: [Interview Date]\n    ● Format: [Interview Type] (e.g., Video Call / In-person)\n    ● Location/Link: [Location or Link]\n    ● Interviewer: [Interviewer Name] ([Interviewer Title])\n\nPlease confirm your availability for this slot. If you are unable to make it, kindly provide 2-3 alternative time slots that work for you.\n\nWe look forward to speaking with you.\n\nBest regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `Subject: Invitation to Interview — [Position] | [Organization Name]\n\nHi [Candidate Name],\n\nGreat news! We were impressed by your background and would love to chat more about the [Position] role at [Organization Name].\n\nHere are the details for your interview:\n\n    📅 [Interview Date]\n    📍 [Location or Link] ([Interview Type])\n    👤 [Interviewer Name] — [Interviewer Title]\n\nDoes this time work for you? Let us know, and we'll send over a calendar invite with all the specifics.\n\nLooking forward to it!\n\n[HR Name]\n[Organization Name]`,
      friendly: `Subject: We'd love to meet you! [Position] Interview at [Organization Name]\n\nHey [Candidate Name]!\n\nThanks for applying to [Organization Name]. We've reviewed your profile and think you could be a great fit for our [Position] team!\n\nWe'd love to hop on a call (or meet in person) to get to know you better.\n\n    When: [Interview Date]\n    Where: [Location or Link]\n    With: [Interviewer Name]\n\nLet us know if this works for you. If not, no worries — just send over a few other times that work best for you.\n\nCheers,\n\n[HR Name]\n[Organization Name]`,
    },
  },
  "rejection-email": {
    title: "Rejection Email",
    category: "Recruitment Emails",
    tab: "email-templates",
    placeholders: ["Candidate Name", "Position", "Organization Name", "Stage Reached", "HR Name"],
    templates: {
      formal: `Subject: Update on your application for [Position] — [Organization Name]\n\nDear [Candidate Name],\n\nThank you for your interest in [Organization Name] and for the time you invested in our recruitment process for the [Position] role. It was a pleasure learning more about your background and experience.\n\nAfter careful consideration, we are writing to inform you that we have decided to move forward with other candidates who more closely align with the current requirements of the role at this stage.\n\nPlease note that this decision is specific to this particular role and does not reflect on your skills or potential. We will keep your information on file and may reach out if a future opening matches your profile.\n\nWe wish you the very best in your professional journey.\n\nBest regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `Subject: Application Update: [Position] at [Organization Name]\n\nHi [Candidate Name],\n\nThanks again for interviewing with us for the [Position] role. We genuinely appreciated the opportunity to speak with you and hear about your experience (reaching the [Stage Reached] stage).\n\nWhile we were impressed with your qualifications, we've decided to proceed with another candidate at this time. \n\nWe'll definitely keep your profile in mind for future openings that might be a better match. In the meantime, we wish you all the best with your current job search!\n\nBest,\n\n[HR Name]\n[Organization Name]`,
      friendly: `Subject: Update regarding the [Position] role\n\nHey [Candidate Name],\n\nFirst of all, thank you so much for the time and energy you put into the [Position] application process. We really enjoyed getting to know you during the [Stage Reached] stage.\n\nI'm writing to let you know that we won't be moving forward with your application this time around. Decisions like these are always tough, especially when we meet talented people like yourself.\n\nWe'd love to stay in touch, and we'll reach out if we see another role that looks like a great fit for you. \n\nWishing you the best of luck with everything!\n\nWarmly,\n\n[HR Name]\n[Organization Name]`,
    },
  },
  "offer-follow-up": {
    title: "Offer Follow-up",
    category: "Recruitment Emails",
    tab: "email-templates",
    placeholders: ["Candidate Name", "Position", "Organization Name", "Offer Sent Date", "Response Deadline", "HR Name"],
    templates: {
      formal: `Subject: Follow-up: Offer of Employment for [Position] at [Organization Name]\n\nDear [Candidate Name],\n\nI hope this email finds you well. I am writing to follow up on the offer letter we extended to you on [Offer Sent Date] for the position of [Position].\n\nWe are very excited about the prospect of you joining our team. Please let us know if you have had a chance to review the documents or if there are any questions regarding the compensation, benefits, or terms of employment that we can clarify for you.\n\nAs a reminder, we would appreciate receiving your response by [Response Deadline].\n\nLooking forward to hearing from you.\n\nBest regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `Subject: Checking in — [Position] Offer | [Organization Name]\n\nHi [Candidate Name],\n\nJust wanted to check in and see if you've had a chance to look over the offer we sent on [Offer Sent Date] for the [Position] role.\n\nWe're all really looking forward to having you on the team! If there's anything at all you're unsure about or if you'd like to hop on a quick call to discuss the details, just let me know.\n\nWe're hoping to hear back by [Response Deadline].\n\nBest,\n\n[HR Name]\n[Organization Name]`,
      friendly: `Subject: Any questions about the [Position] offer? \n\nHey [Candidate Name]!\n\nHope you're having a great week. Just dropping a quick note to see how you're feeling about the [Position] offer we sent over on [Offer Sent Date].\n\nWe'd love to have you on board! If anything is unclear or if you just want to chat through any part of the offer, I'm here to help. \n\nNo pressure, but if you could let us know your thoughts by [Response Deadline], that would be awesome.\n\nCheers,\n\n[HR Name]\n[Organization Name]`,
    },
  },
  "candidate-sourcing": {
    title: "Candidate Sourcing",
    category: "Recruitment Emails",
    tab: "email-templates",
    placeholders: ["Candidate Name", "Position", "Organization Name", "Current Company", "Specific Achievement/Skill", "Company Mission", "Goal", "HR Name"],
    templates: {
      formal: `Subject: Career Opportunity: [Position] at [Organization Name]\n\nDear [Candidate Name],\n\nI came across your profile while researching professionals with expertise in [Specific Achievement/Skill]. Your impressive track record at [Current Company] caught my attention, and I believe your background would be a strong match for a [Position] opening we currently have at [Organization Name].\n\n[Organization Name] is currently [Company Mission]. We are looking for leaders who can help us [Goal].\n\nWould you be open to a brief, 15-minute introductory call to learn more about the role and our vision? Please let me know your availability for later this week.\n\nBest regards,\n\n[HR Name]\nTalent Acquisition\n[Organization Name]`,
      modern: `Subject: [Candidate Name] x [Organization Name] — [Position] Role?\n\nHi [Candidate Name],\n\nI was recently looking through profiles of talented [Position]s and yours really stood out — especially your work on [Specific Achievement/Skill].\n\nI'm with the team at [Organization Name], and we're currently looking for someone to help us [Company Mission]. Given your experience at [Current Company], I think you'd find what we're building here very interesting.\n\nAre you open to a quick chat sometime this week? \n\nBest,\n\n[HR Name]\n[Organization Name]`,
      friendly: `Subject: Quick question from [Organization Name]! \n\nHey [Candidate Name]!\n\nI hope you're doing well. I stumbled across your profile and was really impressed by [Specific Achievement/Skill]. \n\nI'm reaching out because we're growing the [Position] team here at [Organization Name] and we're looking for folks who are passionate about [Company Mission]. I think you'd be a fantastic addition to our culture.\n\nWould you be up for a low-key chat about what you're looking for in your next challenge? \n\nCheers,\n\n[HR Name]\n[Organization Name]`,
    },
  },
  "referral-request": {
    title: "Referral Request",
    category: "Recruitment Emails",
    tab: "email-templates",
    placeholders: ["Organization Name", "Position", "Department", "Referral Bonus Amount", "Link to JD", "HR Name"],
    templates: {
      formal: `Subject: Internal Referral Request: [Position] ([Department])\n\nDear Team,\n\nWe are currently seeking a qualified candidate for the position of [Position] within the [Department] department. As we continue to grow [Organization Name], we believe that our own employees are the best source for finding top-tier talent who align with our values.\n\nIf you know someone who would be a great fit for this role, please submit their resume or LinkedIn profile to the HR department. \n\nAs a reminder, successful referrals are eligible for a referral bonus of [Referral Bonus Amount], payable after the new hire completes their probation period.\n\nThank you for your continued support in building our team.\n\nBest regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `Subject: Help us grow! We're hiring a [Position]\n\nHi Team,\n\nOur [Department] team is expanding, and we're on the hunt for a brilliant [Position]. Who's the best person you've ever worked with in this field?\n\nIf you have someone in mind who would thrive at [Organization Name], we'd love an introduction. \n\nBonus: If your referral joins us, you'll receive a [Referral Bonus Amount] referral reward! \n\nCheck out the full JD here: [Link to JD]\n\nBest,\n\n[HR Name]\n[Organization Name]`,
      friendly: `Subject: Know any great [Position]s? \n\nHey everyone!\n\nWe're looking for a new [Position] to join the [Department] family. Since you already know what it takes to succeed here at [Organization Name], we'd love to see who you've got in your network!\n\nKnow someone awesome? Send them our way! \n\nIf they get hired, we'll say thanks with a [Referral Bonus Amount] referral bonus. \n\nLet's build an amazing team together! \n\nCheers,\n\n[HR Name]`,
    },
  },
  "policy-updates": {
    title: "Policy Updates",
    category: "Internal Communication",
    tab: "email-templates",
    placeholders: ["Organization Name", "Policy Name", "Effective Date", "Key Changes", "Reason for Change", "Audience", "Link to Policy", "HR Name"],
    templates: {
      formal: `Subject: IMPORTANT: Update to [Policy Name] — Effective [Effective Date]\n\nDear [Audience],\n\nThis email is to formally notify you of an update to the [Organization Name] [Policy Name]. These changes will take effect on [Effective Date].\n\nReason for Update:\n[Reason for Change]\n\nKey Changes Include:\n[Key Changes]\n\nAll employees are required to review the updated policy in the Employee Handbook. Please direct any specific questions regarding these changes to the Human Resources department.\n\nThank you for your cooperation.\n\nBest regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `Subject: Policy Update: What you need to know about the new [Policy Name]\n\nHi Team,\n\nWe're updating our [Policy Name] to better support [Reason for Change]. These changes will be live starting [Effective Date].\n\nHere’s a quick summary of what’s changing:\n\n[Key Changes]\n\nYou can find the full document here: [Link to Policy]. If you have any questions, feel free to reach out to the HR team.\n\nBest,\n\n[HR Name]\n[Organization Name]`,
      friendly: `Subject: Heads up! We've updated our [Policy Name] \n\nHey everyone!\n\nJust a quick note to let you know that we've made some tweaks to our [Policy Name], effective [Effective Date]. \n\nWhy the change? We wanted to [Reason for Change]. Here are the highlights:\n\n[Key Changes]\n\nTake a peek at the full details when you have a chance. Questions? We're always here to chat!\n\nCheers,\n\n[HR Name]\n[Organization Name]`,
    },
  },
  "event-invitations": {
    title: "Event Invitations",
    category: "Internal Communication",
    tab: "email-templates",
    placeholders: ["Organization Name", "Event Name", "Event Date", "Event Time", "Venue/Link", "RSVP Deadline", "RSVP Link", "Purpose of Event", "Agenda", "HR Name"],
    templates: {
      formal: `Subject: Invitation: [Event Name] at [Organization Name]\n\nDear Team,\n\nYou are cordially invited to attend [Event Name] on [Event Date]. This event is an opportunity for us to [Purpose of Event].\n\nEvent Details:\n    ● Date: [Event Date]\n    ● Time: [Event Time]\n    ● Venue: [Venue/Link]\n\nAgenda:\n[Agenda]\n\nPlease confirm your attendance by [RSVP Deadline] via the following link: [RSVP Link].\n\nWe look forward to your presence.\n\nBest regards,\n\n[HR Name]\n[Organization Name]`,
      modern: `Subject: You're Invited! [Event Name] — [Event Date]\n\nHi Team,\n\nIt's time for [Event Name]! Join us on [Event Date] at [Event Time] for a session dedicated to [Purpose of Event].\n\nWhere: [Venue/Link]\n\nWhat’s happening:\n[Agenda]\n\nRSVP here by [RSVP Deadline]: [RSVP Link]\n\nSee you there!\n\n[HR Name]\n[Organization Name]`,
      friendly: `Subject: Don't miss out! [Event Name] is happening soon \n\nHey everyone!\n\nWe're hosting [Event Name] on [Event Date] and we'd love to see you all there! \n\n    When: [Event Time]\n    Where: [Venue/Link]\n\nWe've got some fun stuff planned, including:\n[Agenda]\n\nLet us know if you can make it by [RSVP Deadline] so we can get the headcount right! \n\nCheers,\n\n[HR Name]\n[Organization Name]`,
    },
  },
  "performance-review": {
    title: "Performance Review",
    category: "Internal Communication",
    tab: "email-templates",
    placeholders: ["Organization Name", "Review Period", "Self-Assessment Deadline", "Manager Review Deadline", "Instructions", "HR Name"],
    templates: {
      formal: `Subject: Announcement: [Review Period] Performance Review Cycle\n\nDear Team,\n\nWe are officially commencing the performance review cycle for the period of [Review Period]. This process is vital for aligning our individual goals with the strategic objectives of [Organization Name] and fostering professional growth.\n\nImportant Deadlines:\n    ● Self-Assessment Completion: [Self-Assessment Deadline]\n    ● Manager Review Completion: [Manager Review Deadline]\n\nInstructions:\n[Instructions]\n\nThank you for your commitment to excellence and continuous improvement.\n\nBest regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `Subject: [Review Period] Reviews are now open!\n\nHi Team,\n\nIt’s time for our [Review Period] performance reviews. This is a great chance to reflect on your achievements and set the stage for your future growth at [Organization Name].\n\nKey Dates:\n    ✍️ Self-assessments due: [Self-Assessment Deadline]\n    🤝 Manager chats completed by: [Manager Review Deadline]\n\nHow to get started:\n[Instructions]\n\nQuestions? Check the FAQ or reach out to HR.`,
      friendly: `Subject: Time to reflect! [Review Period] Reviews \n\nHey everyone!\n\nIt's that time of year again — our [Review Period] review season is here! We want to celebrate your wins and help you navigate your next steps at [Organization Name].\n\n    ● Your assessment is due by: [Self-Assessment Deadline]\n    ● Manager reviews wrap up on: [Manager Review Deadline]\n\nHere's what you need to do: [Instructions]\n\nLet's make this a great growth opportunity for everyone! \n\nCheers,\n\n[HR Name]`,
    },
  },
  "team-announcements": {
    title: "Team Announcements",
    category: "Internal Communication",
    tab: "email-templates",
    placeholders: ["Organization Name", "Announcement Type", "Person Name", "New Role/Achievement", "Effective Date", "Details", "HR Name"],
    templates: {
      formal: `Subject: Announcement: [Announcement Type] — [Person Name]\n\nDear Team,\n\nWe are pleased to announce the [Announcement Type] of [Person Name] to the position of [New Role/Achievement], effective [Effective Date].\n\nSince joining [Organization Name], [Person Name] has been instrumental in [Details]. \n\nPlease join us in congratulating [Person Name] on this well-deserved milestone and wishing them continued success.\n\nBest regards,\n\n[HR Name]\n[Organization Name]`,
      modern: `Subject: Big News: [Person Name] is our new [New Role/Achievement]!\n\nHi Team,\n\nExciting news! [Person Name] has been [Announcement Type] to [New Role/Achievement], starting [Effective Date].\n\nDuring their time here, they've made a huge impact by [Details]. We can't wait to see what they achieve in this new capacity.\n\nCongrats, [Person Name]!`,
      friendly: `Subject: Celebrating [Person Name]! \n\nHey everyone!\n\nJoin us in a huge round of applause for [Person Name], who is now our [New Role/Achievement]! \n\n[Person Name] has been killing it lately with [Details], and we're so happy to see them take on this new challenge starting [Effective Date].\n\nCongrats [Person Name]! Well deserved! \n\nCheers,\n\n[HR Name]`,
    },
  },
  "new-hire-announcement": {
    title: "New Hire Announcement",
    category: "Internal Communication",
    tab: "email-templates",
    placeholders: ["Organization Name", "New Hire Name", "Job Title", "Department", "Start Date", "Previous Experience Highlights", "Field", "Manager Name", "Fun Fact/Bio", "HR Name"],
    templates: {
      formal: `Subject: Welcoming [New Hire Name] to [Organization Name]\n\nDear Team,\n\nWe are delighted to welcome [New Hire Name] to [Organization Name] as our new [Job Title] in the [Department] department, effective [Start Date].\n\n[New Hire Name] joins us with extensive experience in [Previous Experience Highlights]. They will be reporting to [Manager Name].\n\nFun Fact/Bio: [Fun Fact/Bio]\n\nPlease join us in welcoming [New Hire Name] to the team.\n\nBest regards,\n\n[HR Name]\nHuman Resources\n[Organization Name]`,
      modern: `Subject: Meet our newest team member: [New Hire Name]!\n\nHi Team,\n\nWe're thrilled to introduce [New Hire Name], who is joining the [Department] team as [Job Title] starting [Start Date].\n\n[New Hire Name] brings a wealth of knowledge in [Field] and will be working closely with [Manager Name]. \n\nGet to know them: [Fun Fact/Bio]\n\nWelcome to the family, [New Hire Name]!`,
      friendly: `Subject: Saying hello to [New Hire Name]! \n\nHey everyone!\n\nBig welcome to [New Hire Name], who's joining us as our new [Job Title] in the [Department] team today! \n\nThey're joining [Manager Name]'s team and we're so stoked to have them on board. \n\nQuick fact about [New Hire Name]: [Fun Fact/Bio]\n\nMake sure to say hi when you see them! \n\nCheers,\n\n[HR Name]`,
    },
  },
  "salary-slip": {
    title: "Salary Slip",
    category: "Pay Slip & Salary",
    tab: "payroll",
    placeholders: ["Employee Name", "Employee ID", "Designation", "Month & Year", "Basic Salary", "HRA", "Special Allowance", "Conveyance", "Professional Tax", "Provident Fund", "TDS", "Net Salary"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              PAYSLIP FOR [Month & Year]\n\nEmployee Name: [Employee Name]                                          Employee ID: [Employee ID]\nDesignation: [Designation]\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEARNINGS                                AMOUNT          DEDUCTIONS                              AMOUNT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBasic Salary                            [Basic Salary]  Provident Fund                          [Provident Fund]\nHRA                                     [HRA]           Professional Tax                        [Professional Tax]\nSpecial Allowance                       [Special Allowance] TDS                                     [TDS]\nConveyance                              [Conveyance]\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTOTAL EARNINGS                                          TOTAL DEDUCTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNET SALARY: [Net Salary]\n\n(This is a computer-generated document and does not require a signature.)`,
      modern: `[Organization Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPayslip: [Month & Year]\n\nName: [Employee Name] | ID: [Employee ID]\nRole: [Designation]\n\nEARNINGS:\n    ● Basic: [Basic Salary]\n    ● HRA: [HRA]\n    ● Allowance: [Special Allowance]\n    ● Conveyance: [Conveyance]\n\nDEDUCTIONS:\n    ● PF: [Provident Fund]\n    ● PT: [Professional Tax]\n    ● TDS: [TDS]\n\nNET TAKE HOME: [Net Salary]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      friendly: `Hey [Employee Name]! \n\nHere's your payslip for [Month & Year]. \n\nYour net pay for the month is [Net Salary]. \n\nBreakdown:\n- Fixed: [Basic Salary] (Basic) + [HRA] (HRA)\n- Perks: [Special Allowance] + [Conveyance]\n- Deductions: [Provident Fund] (PF) + [Professional Tax] (PT) + [TDS] (Tax)\n\nThanks for all your hard work! \n\n[Organization Name]`,
    },
  },
  "salary-structure": {
    title: "Salary Structure",
    category: "Pay Slip & Salary",
    tab: "payroll",
    placeholders: ["Annual CTC", "Basic % of CTC", "HRA % of Basic", "Employee Name", "Job Title"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              SALARY STRUCTURE\n\nName: [Employee Name]                                                   Designation: [Job Title]\nAnnual CTC: [Annual CTC]\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCOMPONENT                               MONTHLY                         ANNUAL\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBasic Salary                            (calculated)                    (calculated)\nHRA                                     (calculated)                    (calculated)\nSpecial Allowance                       (calculated)                    (calculated)\n\nRetrials:\nProvident Fund (Employer)               (calculated)                    (calculated)\nGratuity                                (calculated)                    (calculated)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTOTAL COST TO COMPANY                                                   [Annual CTC]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      modern: `[Organization Name]\nSalary Breakdown: [Employee Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRole: [Job Title] | CTC: [Annual CTC]\n\nYour salary is structured as follows:\n- Basic: [Basic % of CTC]% of CTC\n- HRA: [HRA % of Basic]% of Basic\n- Special Allowance: Balancing figure\n- Retrials: Included in CTC\n\nThis structure ensures optimal tax planning while complying with statutory norms.`,
      friendly: `Hi [Employee Name]! \n\nWelcome to [Organization Name]! \n\nYour annual package is [Annual CTC]. Here's how it's broken down:\n- Basic & HRA for your rent & living.\n- Special Allowance for everything else.\n- PF & Gratuity for your future savings.\n\nLet us know if you have any questions about your components!`,
    },
  },
  "reimbursement-claim": {
    title: "Reimbursement Claim",
    category: "Pay Slip & Salary",
    tab: "payroll",
    placeholders: ["Employee Name", "Claim Date", "Expense Category", "Amount", "Description", "Manager Approval"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              EXPENSE REIMBURSEMENT FORM\n\nEmployee: [Employee Name]                                               Date: [Claim Date]\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCATEGORY                                DESCRIPTION                             AMOUNT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[Expense Category]                      [Description]                           [Amount]\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTOTAL CLAIM AMOUNT: [Amount]\n\nEmployee Signature: ____________________\n\nManager Approval: [Manager Approval]`,
      modern: `[Organization Name]\nExpense Claim: [Employee Name]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDate: [Claim Date]\n\nCategory: [Expense Category]\nDetails: [Description]\nAmount: [Amount]\n\nApproved by: [Manager Approval]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      friendly: `Hey Finance Team! \n\nI'm submitting a reimbursement claim for [Expense Category]. \n\nDetails: [Description]\nAmount: [Amount]\nDate: [Claim Date]\n\nMy manager [Manager Approval] has already greenlit this. \n\nThanks! \n[Employee Name]`,
    },
  },
  "bonus-policy": {
    title: "Bonus Policy",
    category: "Compliance",
    tab: "payroll",
    placeholders: ["Organization Name", "Eligibility Criteria", "Performance Period", "Bonus Percentage/Amount", "Payout Date"],
    templates: {
      formal: `                                                                              [Organization Name]\n                                                                              BONUS & VARIABLE PAY POLICY\n\n1. PURPOSE\nThis policy outlines the criteria and process for bonus payments at [Organization Name].\n\n2. ELIGIBILITY\n[Eligibility Criteria]\n\n3. PERFORMANCE PERIOD\nThe assessment period for bonus calculation is [Performance Period].\n\n4. CALCULATION\nEligible employees may receive up to [Bonus Percentage/Amount] of their annual CTC.\n\n5. PAYOUT\nPayments will be disbursed on [Payout Date].`,
      modern: `[Organization Name] | Bonus Policy\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nWe believe in rewarding great work! \n\nWho's eligible? \n[Eligibility Criteria]\n\nWhen? \nCalculated for [Performance Period] and paid out on [Payout Date].\n\nHow much? \nUp to [Bonus Percentage/Amount].`,
      friendly: `Hi Team! \n\nAt [Organization Name], we love celebrating our wins together. \n\nOur bonus scheme for [Performance Period] is live! \n\nIf you meet these criteria: [Eligibility Criteria], you could be eligible for a [Bonus Percentage/Amount] bonus, hitting your account on [Payout Date]. \n\nKeep up the great work!`,
    },
  },
};
