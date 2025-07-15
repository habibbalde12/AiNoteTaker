"use client"

type Note = {
  id: string;
  text: string;
  updatedAt: Date;
};

import { useSearchParams } from "next/navigation";
import { SidebarMenuButton } from "./ui/sidebar";
import Link from "next/link";

type Props = {
  note: Note;
};

function SelectNoteButton({ note }: Props) {
  const noteId = useSearchParams().get("noteId") || "";
  const blankNoteText = "EMPTY NOTE";

  const noteText = note.text || blankNoteText;

  return (
    <SidebarMenuButton
      asChild
      className={`items-start gap-0 pr-12 ${note.id === noteId && "bg-sidebar-accent/50"}`}
    >
      <Link href={`/?noteId=${note.id}`} className="flex h-fit flex-col">
        <p className="w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
          {noteText}
        </p>
        <p className="text-muted-foreground text-xs">
          {note.updatedAt.toLocaleDateString()}
        </p>
      </Link>
    </SidebarMenuButton>
  );
}

export default SelectNoteButton;
