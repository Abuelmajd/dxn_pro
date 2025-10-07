import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full text-center p-4 mt-auto bg-card/80 backdrop-blur-sm border-t border-border">
      <p className="text-sm text-text-secondary">
        للاستفسارات والملاحظات يمكنكم التواصل عبر الرابط التالي: <a href="mailto:motherapp4@gmail.com" className="text-accent hover:underline">https://goo.by/RlgtmQ</a>
      </p>
      <p className="text-sm text-text-secondary mt-2">
        &copy; {currentYear} جميع الحقوق محفوظة.
      </p>
    </footer>
  );
};

export default Footer;