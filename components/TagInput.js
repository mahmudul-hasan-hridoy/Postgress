import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TagInput({ tags, onChange }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onChange([...tags, inputValue.trim()]);
      setInputValue("");
      e.preventDefault();
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  return (
    <div>
      <Label className="block mb-2" htmlFor="tags">
        Tags
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center bg-gray-200 rounded px-2 py-1"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-red-500"
              onClick={() => handleRemoveTag(index)}
            >
              ×
            </button>
          </span>
        ))}
        <Input
          id="tags"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a tag and press Enter"
        />
      </div>
    </div>
  );
}
