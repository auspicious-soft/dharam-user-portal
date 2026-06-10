import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  CountryCodeOption,
  getCountryCodeFromSearchInput,
  getCountryCodeOptionLabel,
} from "@/utils/countryCodeOptions";

type CountryCodeSearchInputProps = {
  id: string;
  value: string;
  searchValue: string;
  options: CountryCodeOption[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
  onSearchValueChange: (value: string) => void;
};

const matchesCountryCodeSearch = (
  option: CountryCodeOption,
  query: string
) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return (
    option.value.toLowerCase().includes(normalizedQuery) ||
    option.label.toLowerCase().includes(normalizedQuery) ||
    option.countryName.toLowerCase().includes(normalizedQuery) ||
    option.isoCode.toLowerCase().includes(normalizedQuery)
  );
};

const CountryCodeSearchInput = ({
  id,
  value,
  searchValue,
  options,
  disabled = false,
  onValueChange,
  onSearchValueChange,
}: CountryCodeSearchInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldFilter, setShouldFilter] = useState(false);

  const visibleOptions = useMemo(() => {
    if (!shouldFilter) {
      return options;
    }

    return options.filter((option) =>
      matchesCountryCodeSearch(option, searchValue)
    );
  }, [options, searchValue, shouldFilter]);

  const selectCountryCode = (option: CountryCodeOption) => {
    onValueChange(option.value);
    onSearchValueChange(option.label);
    setShouldFilter(false);
    setIsOpen(false);
  };

  const normalizeSearchValue = () => {
    const supportedCode = getCountryCodeFromSearchInput(
      searchValue,
      options,
      value
    );
    onValueChange(supportedCode);
    onSearchValueChange(getCountryCodeOptionLabel(supportedCode, options));
  };

  return (
    <div className="relative w-44 shrink-0">
      <Input
        type="text"
        id={id}
        value={searchValue}
        disabled={disabled}
        onFocus={() => {
          setShouldFilter(false);
          setIsOpen(true);
        }}
        onChange={(event) => {
          const nextSearchValue = event.target.value;
          onSearchValueChange(nextSearchValue);
          onValueChange(
            getCountryCodeFromSearchInput(nextSearchValue, options, value)
          );
          setShouldFilter(true);
          setIsOpen(true);
        }}
        onBlur={() => {
          normalizeSearchValue();
          setIsOpen(false);
        }}
        placeholder={disabled ? "Loading..." : "Country code"}
        className="w-full border-0 rounded-tr-none rounded-br-none pr-1"
        aria-label="Country code"
        autoComplete="off"
      />

      {isOpen && !disabled && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-60 w-72 overflow-y-auto rounded-lg border border-[#e8e8e8] bg-white py-1 shadow-lg">
          {visibleOptions.length ? (
            visibleOptions.map((option) => (
              <button
                type="button"
                key={`${option.isoCode}-${option.value}`}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-paragraph hover:bg-light-blue"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCountryCode(option)}
              >
                <span className="truncate">{option.countryName}</span>
                <span className="shrink-0 font-medium">{option.value}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-paragraph">
              No country code found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CountryCodeSearchInput;
