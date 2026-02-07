import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";

// A predefined list of Palestinian cities and major Arab neighborhoods.
const palestinianLocations = [
  "القدس",
  "رام الله",
  "الخليل",
  "نابلس",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "بيت لحم",
  "أريحا",
  "غزة",
  "خانيونس",
  "رفح",
  "يافا",
  "حيفا",
  "عكا",
  "الناصرة",
  "اللد",
  "الرملة",
  "أم الفحم",
  "الطيبة",
  "الطيرة",
  "كفر قاسم",
  "الشيخ جراح",
  "سلوان",
  "بيت حنينا",
  "عناتا",
  "شعفاط",
  "وادي الجوز",
  "طوباس",
  "سلفيت",
  "البيرة",
  "يطا",
  "الظاهرية",
  "دورا",
  "بيت ساحور",
  "بيت جالا",
  "عنبتا",
  "البلدة القديمة (القدس)",
  "البلدة القديمة (الخليل)",
  "البلدة القديمة (نابلس)",
].sort((a, b) => a.localeCompare(b, "ar")); // Sort alphabetically for Arabic

interface AddressDropdownProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
  id: string;
  required?: boolean;
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({
  value,
  onChange,
  label,
  name,
  id,
  required = false,
}) => {
  const { t } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter locations when input value changes
  useEffect(() => {
    if (value) {
      const filtered = palestinianLocations.filter((location) =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setIsOpen(
        filtered.length > 0 &&
          document.activeElement === wrapperRef.current?.querySelector("input")
      );
    } else {
      setFilteredLocations([]);
      setIsOpen(false);
    }
  }, [value]);

  // Handle clicks outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Handle suggestion selection
  const handleSelect = (location: string) => {
    const event = {
      target: { name, value: location },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-primary mb-1"
      >
        {label}
      </label>
      <input
        type="text"
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => value && filteredLocations.length > 0 && setIsOpen(true)}
        className="w-full p-2 bg-input-bg rounded-md border border-border focus:ring-accent focus:border-accent"
        required={required}
        placeholder={t("selectAddress")}
        autoComplete="off"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredLocations.map((location) => (
            <li key={location}>
              <button
                type="button"
                className="w-full text-start px-4 py-2 text-sm text-text-primary hover:bg-card-secondary transition-colors"
                onClick={() => handleSelect(location)}
              >
                {location}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressDropdown;
