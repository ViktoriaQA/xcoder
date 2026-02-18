import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
  return (
    <footer className="w-full border-t border-border bg-card/95 backdrop-blur-sm py-4 px-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            
            {/* <span>|</span> */}
            <span>{t('footer.copyright', { year: currentYear })}</span>
            <span>|</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
