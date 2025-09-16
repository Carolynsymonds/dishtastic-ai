import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void;
  className?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

const PROMPT_SUGGESTIONS = [
  "Margherita pizza with fresh mozzarella and basil",
  "Chocolate lava cake with vanilla ice cream",
  "Ramen bowl with soft-boiled egg and nori",
  "Grilled salmon with lemon herb butter",
  "Chicken curry with aromatic spices and rice",
  "A gourmet burger with crispy bacon and melted cheese",
  "Fresh sushi rolls with wasabi and pickled ginger",
  "Homemade pasta with rich tomato sauce and basil",
  "Caesar salad with crispy croutons and parmesan",
  "Beef stir-fry with colorful vegetables",
  "Apple pie with cinnamon and caramel drizzle",
  "Fish tacos with cabbage slaw and lime",
  "Tiramisu with coffee and mascarpone layers",
  "BBQ ribs with smoky sauce and coleslaw",
  "Caprese salad with tomatoes and mozzarella",
  "Banana bread with walnuts and chocolate chips"
];

export default function PromptSuggestions({ onSelect, className = "", textareaRef }: PromptSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleTextareaClick(event: MouseEvent) {
      if (textareaRef?.current && textareaRef.current.contains(event.target as Node)) {
        setIsOpen(true);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleTextareaClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleTextareaClick);
    };
  }, [textareaRef]);

  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    setIsOpen(false);
  };

  return (
    <>
      <div 
        className={`absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-hidden transition-all duration-200 ease-in-out transform ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        } ${className}`} 
        ref={dropdownRef}
      >
        <div className="max-h-40 overflow-y-auto">
          {PROMPT_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors border-b border-input last:border-b-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
