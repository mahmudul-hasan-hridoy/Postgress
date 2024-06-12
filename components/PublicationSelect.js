// components/PublicationSelect.js
import { useState, useEffect } from "react";

export default function PublicationSelect({ onChange }) {
  const [publications, setPublications] = useState([]);
  const [newPublication, setNewPublication] = useState("");
  const [selectedPublication, setSelectedPublication] = useState("");

  useEffect(() => {
    setPublications([
      { id: "1", name: "Tech Insights" },
      { id: "2", name: "Health and Wellness" },
    ]);
  }, []);

  const handlePublicationChange = (e) => {
    setSelectedPublication(e.target.value);
    onChange(e.target.value);
  };

  const handleNewPublicationChange = (e) => {
    setNewPublication(e.target.value);
  };

  const handleNewPublicationSubmit = (e) => {
    e.preventDefault();
    const newPub = { id: new Date().toISOString(), name: newPublication };
    setPublications([...publications, newPub]);
    setSelectedPublication(newPub.id);
    onChange(newPub.id);
    setNewPublication("");
  };

  return (
    <div>
      <label className="block mb-2" htmlFor="publication">
        Publication
      </label>
      <select
        id="publication"
        value={selectedPublication}
        onChange={handlePublicationChange}
        className="w-full p-2 border border-gray-300 rounded mb-2"
      >
        <option value="">Select a publication</option>
        {publications.map((pub) => (
          <option key={pub.id} value={pub.id}>
            {pub.name}
          </option>
        ))}
      </select>
      <form
        onSubmit={handleNewPublicationSubmit}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={newPublication}
          onChange={handleNewPublicationChange}
          placeholder="Or create a new publication"
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Create
        </button>
      </form>
    </div>
  );
}
