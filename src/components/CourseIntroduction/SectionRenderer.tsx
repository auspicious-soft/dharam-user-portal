import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import AboutIcon from "@/assets/abouticon.png";

type BulletItem = {
  title: string;
  description: string;
};

type AccordionItem = {
  title: string;
  content: string;
};

type CardItem = string;

type Section = {
  id: string;
  type: "bullets" | "accordion" | "cards";
  title: string;
  items: BulletItem[] | AccordionItem[] | CardItem[];
};

const SectionRenderer = ({ section }: { section: Section }) => {
  return (
    <section className="flex flex-col gap-4">
      {/* ✅ Dynamic Section Title */}
       <h3 className="text-Black_light text-xl font-bold">{section.title}</h3>

      {/* ✅ Section Type Rendering */}
      {section.type === "bullets" && (
        <ul className="space-y-2">
          {(section.items as BulletItem[]).map((item, i) => (
            <li key={i} className="text-paragraph text-sm font-medium flex">
              <span className="mx-2 mt-[-1px]">•</span>{item.description}
            </li>
          ))}
        </ul>
      )}

      {section.type === "accordion" && (
        <Accordion type="single" collapsible>
          {(section.items as AccordionItem[]).map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>
                {item.title}
              </AccordionTrigger>
              <AccordionContent>
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {section.type === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(section.items as CardItem[]).map((item, i) => (
            <div
              key={i}
              className="p-1.5 bg-light-blue rounded-lg flex items-center gap-[10px]"
            >
                <img src={AboutIcon} alt="About Icon" className="max-w-12" />
              <p className="text-paragraph text-sm font-medium">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SectionRenderer;
