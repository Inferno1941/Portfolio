// Shared defaults and field definitions keep the editor and API in agreement.
const text = (label, value, max = 180) => ({
  label,
  default: value,
  max,
  type: "text",
});
const paragraph = (label, value, max = 3000) => ({
  label,
  default: value,
  max,
  type: "textarea",
});
const toggle = (label, value = true) => ({
  label,
  default: value,
  type: "boolean",
});
export const siteSections = [
  {
    id: "identity",
    title: "Identity & navigation",
    fields: {
      name: text("Your name", "Tarek AlKhouri"),
      brand: text("Logo text", "tk", 20),
      pageTitle: text(
        "Browser page title",
        "Tarek Alkhouri — Developer & Teacher",
      ),
      workLabel: text("Work navigation label", "Work", 40),
      aboutLabel: text("About navigation label", "About", 40),
      contactLabel: text("Contact navigation label", "Let’s talk", 40),
    },
  },
  {
    id: "hero",
    title: "Introduction",
    fields: {
      visible: toggle("Show introduction"),
      eyebrow: text("Intro label", "DEVELOPER. EDUCATOR. BUILDER."),
      title: paragraph("Main heading", "Thoughtful code.\nMeaningful", 240),
      highlight: text("Highlighted heading text", "experiences.", 100),
      description: paragraph(
        "Introduction paragraph",
        "I’m Tarek AlKhouri, a frontend developer and teacher based in Lebanon. I turn complex ideas into simple, useful digital experiences.",
      ),
      workButton: text("Work button label", "Explore my work", 60),
      contactButton: text(
        "Contact link label (jumps to the contact section)",
        "Get in touch",
        60,
      ),
      location: text("Location", "Zahle, Lebanon", 100),
      note: text("Location tagline", "Building with purpose", 100),
    },
  },
  {
    id: "artwork",
    title: "Introduction artwork",
    fields: {
      visible: toggle("Show code artwork"),
      label: text("Artwork label", "IDEAS → REALITY", 60),
      windowTitle: text("Code window title", "the way I build", 80),
      code: paragraph(
        "Code illustration text",
        "// A little curiosity goes a long way\nconst developer = {\n  name: 'Tarek',\n  focus: 'People first',\n  tools: ['React', 'Firebase'],\n  always: 'Learning'\n};\n\nbuild(ideas).makeADifference();",
        1500,
      ),
      badgeTitle: text("Badge title", "Built with care", 80),
      badgeDescription: text(
        "Badge subtitle",
        "From the first pixel to the last line.",
        120,
      ),
    },
  },
  {
    id: "toolkit",
    title: "Toolkit",
    fields: {
      visible: toggle("Show toolkit"),
      label: text("Toolkit label", "MY EVERYDAY TOOLKIT"),
      items: {
        label: "Technologies",
        type: "list",
        max: 60,
        limit: 20,
        default: [
          "React",
          "Firebase",
          "Tailwind CSS",
          "Flutter",
          "React Native",
        ],
      },
    },
  },
  {
    id: "work",
    title: "Projects section",
    fields: {
      visible: toggle("Show projects section"),
      eyebrow: text("Projects label", "01 / SELECTED WORK"),
      title: paragraph("Projects heading", "Ideas, brought to life.", 240),
      description: paragraph(
        "Projects introduction",
        "Practical solutions for real classrooms,\nbusinesses, and everyday life.",
      ),
      emptyMessage: text(
        "Message when no projects are published",
        "New work is on the way. Check back soon.",
        300,
      ),
    },
  },
  {
    id: "about",
    title: "About me",
    fields: {
      visible: toggle("Show about section"),
      eyebrow: text("About label", "02 / THE PERSON BEHIND THE CODE"),
      title: paragraph(
        "About heading",
        "A teacher’s mindset.\nA developer’s toolkit.",
        240,
      ),
      paragraphs: {
        label: "About paragraphs",
        type: "list",
        multiline: true,
        max: 5000,
        limit: 12,
        default: [
          "I hold a Computer Science and Information degree from AUST. By day, I teach mathematics and physics in Zahle. Alongside teaching, I build web and mobile applications that make everyday work easier.",
          "Through Digital Builders Academy, I help beginners take their first steps in web and mobile development. Whether I’m explaining a theorem or designing an interface, I believe the best solutions make complex things feel simple.",
        ],
      },
      buttonLabel: text(
        "Contact link label",
        "Let’s build something together",
        100,
      ),
      cards: {
        label: "About cards",
        type: "cards",
        limit: 9,
        default: [
          {
            title: "Build with intention",
            description:
              "Responsive interfaces and practical applications, made for the people using them.",
          },
          {
            title: "Share what you learn",
            description:
              "Mathematics, physics, and development. A little clarity can open a lot of doors.",
          },
          {
            title: "Stay curious",
            description:
              "Exploring TypeScript, Node.js, and Appwrite. Always finding a better way to build.",
          },
        ],
      },
    },
  },
  {
    id: "contact",
    title: "Contact",
    fields: {
      visible: toggle("Show contact section"),
      eyebrow: text("Contact label", "03 / WHAT’S NEXT?"),
      title: paragraph(
        "Contact heading",
        "Good things start\nwith a conversation.",
        240,
      ),
      description: paragraph(
        "Contact paragraph",
        "Have a project, a collaboration, or a class in mind? Let’s talk.",
      ),
      email: {
        ...text("Contact email address", "tarekkhouri7@gmail.com", 254),
        type: "email",
      },
      buttonLabel: text("Contact button label", "tarekkhouri7@gmail.com", 254),
      copyLabel: text(
        "Copy email button label (leave empty to hide)",
        "Copy email",
        60,
      ),
      copiedMessage: text(
        "Message after copying",
        "Email address copied.",
        120,
      ),
      copyFailedMessage: text(
        "Message when copying fails (the address is shown after it)",
        "Copy this address:",
        120,
      ),
    },
  },
  {
    id: "footer",
    title: "Footer",
    fields: {
      visible: toggle("Show footer"),
      copyright: text(
        "Copyright text (current year is added automatically)",
        "Tarek AlKhouri · Made with intention.",
        300,
      ),
      studioLabel: text("Admin link label", "Studio", 60),
    },
  },
];
export const defaultSite = Object.fromEntries(
  siteSections.map((section) => [
    section.id,
    Object.fromEntries(
      Object.entries(section.fields).map(([key, field]) => [
        key,
        field.default,
      ]),
    ),
  ]),
);

// Missing fields receive defaults during migration; explicit empty text stays empty.
export function validateSite(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid page content.");
  return Object.fromEntries(
    siteSections.map((section) => {
      const values = input[section.id] === undefined ? {} : input[section.id];
      if (!values || typeof values !== "object" || Array.isArray(values))
        throw new Error(`Invalid ${section.title}.`);
      return [
        section.id,
        Object.fromEntries(
          Object.entries(section.fields).map(([key, field]) => {
            const value =
              values[key] === undefined
                ? structuredClone(field.default)
                : values[key];
            const error = () => {
              throw new Error(`Check ${section.title}: ${field.label}.`);
            };
            const validText = (v, max) =>
              typeof v === "string" && v.length <= max;
            if (field.type === "boolean") {
              if (typeof value !== "boolean") error();
            } else if (field.type === "list") {
              if (
                !Array.isArray(value) ||
                value.length > field.limit ||
                value.some((v) => !validText(v, field.max))
              )
                error();
            } else if (field.type === "cards") {
              if (
                !Array.isArray(value) ||
                value.length > field.limit ||
                value.some(
                  (v) =>
                    !v ||
                    !validText(v.title, 150) ||
                    !validText(v.description, 1500),
                )
              )
                error();
            } else {
              if (!validText(value, field.max)) error();
              if (
                field.type === "email" &&
                !/^[^\s@<>?#&]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
              )
                error();
            }
            return [
              key,
              field.type === "cards"
                ? value.map((v) => ({
                    title: v.title,
                    description: v.description,
                  }))
                : value,
            ];
          }),
        ),
      ];
    }),
  );
}
