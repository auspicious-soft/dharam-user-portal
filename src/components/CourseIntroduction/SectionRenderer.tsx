import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import abouticon from "@/assets/abouticon.png";

type BulletItem = {
  title: string;
  description: string;
};

type AccordionItem = {
  title: string;
  content: string;
};

type CardItem = string;

type LinkItem = {
  label: string;
  url: string;
};

type Section = {
  id: string;
  type: "bullets" | "accordion" | "cards" | "links";
  title: string;
  items: BulletItem[] | AccordionItem[] | CardItem[] | LinkItem[];
};

const SectionRenderer = ({ section }: { section: Section }) => {
  return (
    <section className="flex flex-col gap-4">
      {/* Dynamic Section Title */}
      <h3 className="text-Black_light text-xl font-bold">{section.title}</h3>

      {/* Section Type Rendering */}
      {section.type === "bullets" && (
        <ul className="space-y-2">
          {(section.items as BulletItem[]).map((item, i) => (
            <li key={i} className="text-paragraph text-sm font-medium flex">
              <span className="mx-2 mt-[-1px]">•</span>
              {item.description}
            </li>
          ))}
        </ul>
      )}

      {section.type === "accordion" && (
        <Accordion type="single" collapsible>
          {(section.items as AccordionItem[]).map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {section.type === "cards" && (
        <ul className="space-y-2 list-disc pl-5">
          {(section.items as CardItem[]).map((item, i) => (
            <li key={i} className="text-paragraph text-sm font-medium">
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.type === "links" && (
        <div className="flex flex-col gap-2">
          {(section.items as LinkItem[]).map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="bg-[#F0F8FF                                                    ] rounded-lg px-3 py-2 flex items-center gap-3"
            >
                <img src={abouticon} alt="File icon" className="h-10 w-10" />
              <span className="text-paragraph text-sm font-medium">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default SectionRenderer;
