export interface StaticSection {
  heading: string;
  body: string;
}

export interface StaticPageContent {
  title: string;
  sections: StaticSection[];
}

export const privacyPage: StaticPageContent = {
  title: 'Privacy Policy',
  sections: [
    {
      heading: 'Information We Collect',
      body: 'When you sign up for an account, we collect your email address and display name. If you sign in with Google, we receive your name and email from your Google profile. When you subscribe to our newsletter, we store your email address. When you leave a comment or bookmark an article, we associate that activity with your account.',
    },
    {
      heading: 'How We Use Your Information',
      body: 'We use your information to provide and improve the magazine experience: publishing your comments, saving your reading list, sending newsletters you have subscribed to, and personalising content recommendations. We do not sell your personal data to third parties.',
    },
    {
      heading: 'Cookies and Local Storage',
      body: 'We use localStorage to remember your theme preference (dark/light mode) and whether you have dismissed the sign-in prompt. Our hosting platform (Vercel) and authentication provider (Supabase) may set essential cookies for session management and security. We do not use tracking cookies or analytics cookies at this time.',
    },
    {
      heading: 'Third-Party Services',
      body: 'Ubuntu Essence relies on the following third-party services: Supabase (authentication, database, file storage), Vercel (hosting), and Google (OAuth sign-in). Each service has its own privacy policy governing how they handle data. We recommend reviewing their policies for complete transparency.',
    },
    {
      heading: 'Your Rights',
      body: 'You can update your display name, avatar, and bio at any time from your profile page. You can delete your comments individually. To request deletion of your entire account and associated data, please contact us. You can unsubscribe from newsletters at any time using the link in each email.',
    },
    {
      heading: 'Data Retention',
      body: 'We retain your account information until you request deletion. Comments and bookmarks are stored as long as your account exists. Newsletter subscriber emails are retained until you unsubscribe. We may retain anonymised aggregate data indefinitely for analytical purposes.',
    },
    {
      heading: 'Changes to This Policy',
      body: 'We may update this privacy policy from time to time. Significant changes will be notified via the website or email. Continued use of the site after changes constitutes acceptance of the updated policy.',
    },
    {
      heading: 'Contact',
      body: 'For privacy-related inquiries, you can reach us at privacy@ubuntuessence.com. We will respond to your request within 30 days.',
    },
  ],
};

export const termsPage: StaticPageContent = {
  title: 'Terms of Service',
  sections: [
    {
      heading: 'Acceptance of Terms',
      body: 'By accessing or using Ubuntu Essence, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site. We reserve the right to update these terms at any time, with notice posted on this page.',
    },
    {
      heading: 'User Accounts',
      body: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating an account. You may not use another person\'s account without permission. You are responsible for all activity that occurs under your account.',
    },
    {
      heading: 'User Conduct',
      body: 'You agree to use the site respectfully. Prohibited behaviour includes: posting abusive, harassing, or hateful comments; attempting to bypass security measures; scraping content without permission; impersonating others; and using the site for any unlawful purpose.',
    },
    {
      heading: 'Content Ownership',
      body: 'Articles and images published on Ubuntu Essence are owned by their respective authors and contributors. You may share links to our content and quote excerpts with attribution. You may not reproduce full articles without permission.',
    },
    {
      heading: 'User-Generated Content',
      body: 'Comments you post become part of the public record on the site. You retain ownership of your comments but grant us a non-exclusive, worldwide license to display them on the platform. We reserve the right to moderate or remove comments that violate our conduct guidelines.',
    },
    {
      heading: 'Disclaimer',
      body: 'Ubuntu Essence is provided "as is" without warranties of any kind. We strive for accuracy but do not guarantee that all content is error-free. We are not liable for any damages arising from your use of the site.',
    },
    {
      heading: 'Termination',
      body: 'We reserve the right to suspend or terminate accounts that violate these terms, at our sole discretion. You may delete your account at any time by contacting us.',
    },
  ],
};

export const cookiesPage: StaticPageContent = {
  title: 'Cookie Policy',
  sections: [
    {
      heading: 'What Are Cookies',
      body: 'Cookies are small text files stored on your device by your web browser. They help websites remember your preferences and improve your experience. We also use browser localStorage for similar purposes.',
    },
    {
      heading: 'Essential Local Storage',
      body: 'We store the following in your browser\'s localStorage: a theme preference (dark or light mode) and a flag indicating whether you have dismissed the sign-in prompt. This data never leaves your browser and is not sent to our servers.',
    },
    {
      heading: 'Authentication Session',
      body: 'Supabase, our authentication provider, stores a session token in localStorage to keep you signed in across page visits. This token is essential for the functioning of user accounts and is deleted when you sign out.',
    },
    {
      heading: 'Third-Party Storage',
      body: 'Our hosting provider, Vercel, may set essential cookies for content delivery and security. We do not use advertising cookies, tracking cookies, or analytics cookies from any third party.',
    },
    {
      heading: 'Managing Cookies',
      body: 'You can clear localStorage and cookies at any time through your browser settings. Please note that clearing authentication tokens will sign you out, and clearing theme preferences will reset to the default light mode.',
    },
  ],
};

export const aboutPage: StaticPageContent = {
  title: 'About Ubuntu Essence',
  sections: [
    {
      heading: 'Our Mission',
      body: 'Ubuntu Essence is a digital magazine dedicated to celebrating African culture, heritage, and the spirit of togetherness. We believe in the power of storytelling to connect communities, preserve traditions, and inspire future generations.',
    },
    {
      heading: 'The Name',
      body: '"Ubuntu" is a Nguni Bantu term meaning "humanity" — often translated as "I am because we are." This philosophy of interconnectedness and community is at the heart of everything we publish. We explore how this timeless concept resonates in modern African life, art, politics, and culture.',
    },
    {
      heading: 'Our Content',
      body: 'We publish articles on art, culture, philosophy, politics, lifestyle, and heritage. Our contributors include writers, academics, artists, and thought leaders from across Africa and the diaspora. Each piece is selected to inform, inspire, and spark meaningful conversation.',
    },
    {
      heading: 'Join Us',
      body: 'Ubuntu Essence grows through community participation. Subscribe to our newsletter for weekly stories, save articles to your reading list, join the conversation through comments, and share pieces that resonate with you. Together, we amplify African voices.',
    },
  ],
};

export const contactPage: StaticPageContent = {
  title: 'Contact Us',
  sections: [
    {
      heading: 'Get in Touch',
      body: 'We welcome your feedback, story ideas, and questions. The best way to reach us is by email. We aim to respond within 48 hours.',
    },
    {
      heading: 'Email',
      body: 'General inquiries: hello@ubuntuessence.com\nEditorial: editors@ubuntuessence.com\nPrivacy concerns: privacy@ubuntuessence.com',
    },
    {
      heading: 'Contributors',
      body: 'Interested in writing for Ubuntu Essence? Send a brief pitch and writing sample to editors@ubuntuessence.com. We review pitches on a rolling basis and aim to respond within two weeks.',
    },
  ],
};
