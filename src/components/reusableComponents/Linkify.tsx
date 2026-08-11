import React from "react";

interface LinkifyProps {
  text?: string | null;
}

const Linkify = ({ text = "" }: LinkifyProps) => {
  if (!text) return <span />;

  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(/^https?:\/\//)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {part}
            </a>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default Linkify;
