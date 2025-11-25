# **App Name**: UXUA Housekeeping Checklist

## Core Features:

- Technician and House Selection: Allow users to select their name and the house they are inspecting from predefined lists.
- Checklist Display: Display a checklist of items to be verified in each house, categorized for clarity.
- Status Updates: Allow technicians to update the status of each item (Pending, OK, Problem Resolved, Problem Persisting) via a modal.
- Note Taking: Enable technicians to add notes to each item, especially when marking a problem as persistent.
- Data Storage: Store the checklist data in Firestore, associated with the specific house.
- Real-time Updates: Update the checklist in real-time for all users.
- Generative Summary of Issues: Use generative AI to summarize ongoing maintenance issues per property, making it a 'tool' that can decide what issues to incorporate.

## Style Guidelines:

- Primary color: Indigo (#4F46E5) for a clean and modern feel.
- Background color: Light gray (#F7F7F7) for a neutral backdrop.
- Accent color: Green (#34D399) to highlight 'OK' status indicators.
- Body and headline font: 'Inter', sans-serif for a clean and readable interface. Note: currently only Google Fonts are supported.
- Use clear and recognizable icons for each status and category.
- A clean, responsive layout that adapts to different screen sizes.
- Subtle transitions and animations for status changes and modal appearances.