import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto Detect' },
  { code: 'en-US', name: 'American English', nativeName: 'English (US)' },
  { code: 'en-GB', name: 'British English', nativeName: 'English (UK)' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt-BR', name: 'Portuguese (Brazilian)', nativeName: 'Português (Brasil)' },
  { code: 'zh-CN', name: 'Chinese Mandarin', nativeName: '中文 (普通话)' },
];

interface LanguagePickerProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  className?: string;
  compact?: boolean;
  mobileBottomBar?: boolean;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = '',
  compact = false,
  mobileBottomBar = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGES);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLang = LANGUAGES.find((lang) => lang.code === selectedLanguage) || LANGUAGES[0];

  useEffect(() => {
    const filtered = LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredLanguages(filtered);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (compact) {
    const dropdownPositionClass = mobileBottomBar
      ? 'absolute bottom-full mb-2 left-0 z-50 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5'
      : 'absolute left-0 z-50 mt-1 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5';

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-semibold">{selectedLang.name}</span>
          <ChevronDownIcon
            className={`ml-1 h-4 w-4 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className={dropdownPositionClass}>
            <div className="p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 py-2 pl-9 pr-3 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-auto">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none ${
                      selectedLanguage === language.code
                        ? 'bg-zinc-100 font-medium text-zinc-900'
                        : 'text-zinc-700'
                    }`}
                    onClick={() => handleLanguageSelect(language.code)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{language.name}</span>
                      <span className="text-xs text-zinc-500">{language.nativeName}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-zinc-500">No languages found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          <span className="mr-2 text-xs text-zinc-500">Language:</span>
          <span>{selectedLang.name}</span>
        </span>
        <ChevronDownIcon
          className={`ml-2 h-4 w-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-300 py-2 pl-9 pr-3 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none ${
                    selectedLanguage === language.code
                      ? 'bg-zinc-100 font-medium text-zinc-900'
                      : 'text-zinc-700'
                  }`}
                  onClick={() => handleLanguageSelect(language.code)}
                >
                  <div className="flex items-center justify-between">
                    <span>{language.name}</span>
                    <span className="text-xs text-zinc-500">{language.nativeName}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-zinc-500">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
