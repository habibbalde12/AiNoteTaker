import { Note } from '@prisma/client';
import {
  SidebarGroupContent as SidebarGroupContentShadCN,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import Fuse from "fuse.js";
import SelectNoteButton from "./SelectNoteButton";
import DeleteNoteButton from "./DeleteNoteButton";

type Props = {
  notes: Note[];
};

function SidebarGroupContent({ notes }: Props) {
  const [searchText, setSearchText] = useState("");
  const fuse = new Fuse(notes, {
    keys: ["text"],
    threshold: 0.4,
  });

  const filteredNotes = searchText
    ? fuse.search(searchText).map((result) => result.item)
    : notes;

  const deleteNoteLocally = (noteId: string) => {
    // This stays client-side in DeleteNoteButton
  };

  return (
    <SidebarGroupContentShadCN>
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-2 size-4" />
        <Input
          className="bg-muted pl-8"
          placeholder="Search your notes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <SidebarMenu className="mt-4">
        {filteredNotes.map((note) => (
          <SidebarMenuItem key={note.id} className="group/item">
            <SelectNoteButton note={note} />
            <DeleteNoteButton
              noteId={note.id}
              deleteNoteLocally={() => {}}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContentShadCN>
  );
}

export default SidebarGroupContent;
