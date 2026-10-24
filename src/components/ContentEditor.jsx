import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { siteSections } from "../data/site";

export default function ContentEditor({ site, onChange }) {
  function update(section, key, value) {
    const next = { ...site[section], [key]: value };
    if (
      section === "contact" &&
      key === "email" &&
      site.contact.buttonLabel === site.contact.email
    )
      next.buttonLabel = value;
    onChange({ ...site, [section]: next });
  }
  return (
    <div className="content-editor">
      <p className="content-help">
        Edit any section below. Line breaks in headings and paragraphs are
        preserved. Use Preview to review the full page, then Save changes to
        publish.
      </p>
      {siteSections.map((section) => (
        <details
          className="content-section"
          key={section.id}
          open={section.id === "hero" || section.id === "about"}
        >
          <summary>
            {section.title}
            <span>Edit content</span>
          </summary>
          <div className="content-fields">
            {Object.entries(section.fields).map(([key, field]) => (
              <ContentField
                key={key}
                field={field}
                value={site[section.id][key]}
                id={`${section.id}-${key}`}
                onChange={(value) => update(section.id, key, value)}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
function ContentField({ field, value, onChange, id }) {
  if (field.type === "boolean")
    return (
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  if (field.type === "list" || field.type === "cards") {
    const cards = field.type === "cards";
    function move(index, offset) {
      const next = [...value];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      onChange(next);
    }
    return (
      <fieldset className="content-list">
        <legend>{field.label}</legend>
        {value.map((item, index) => (
          <div className="content-list-item" key={index}>
            <div className="content-item-fields">
              {cards ? (
                <>
                  <label>
                    Card {index + 1} title
                    <input
                      maxLength={150}
                      value={item.title}
                      onChange={(e) =>
                        onChange(
                          value.map((v, i) =>
                            i === index ? { ...v, title: e.target.value } : v,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Card {index + 1} description
                    <textarea
                      rows={3}
                      maxLength={1500}
                      value={item.description}
                      onChange={(e) =>
                        onChange(
                          value.map((v, i) =>
                            i === index
                              ? { ...v, description: e.target.value }
                              : v,
                          ),
                        )
                      }
                    />
                  </label>
                </>
              ) : (
                <label>
                  {field.multiline ? "Paragraph" : "Technology"} {index + 1}
                  {field.multiline ? (
                    <textarea
                      rows={5}
                      maxLength={field.max}
                      value={item}
                      onChange={(e) =>
                        onChange(
                          value.map((v, i) =>
                            i === index ? e.target.value : v,
                          ),
                        )
                      }
                    />
                  ) : (
                    <input
                      maxLength={field.max}
                      value={item}
                      onChange={(e) =>
                        onChange(
                          value.map((v, i) =>
                            i === index ? e.target.value : v,
                          ),
                        )
                      }
                    />
                  )}
                </label>
              )}
            </div>
            <div className="content-item-actions">
              <button
                type="button"
                className="icon-button"
                aria-label={`Move ${field.label} item ${index + 1} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={`Move ${field.label} item ${index + 1} down`}
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                className="icon-button danger"
                aria-label={`Remove ${field.label} item ${index + 1}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="button secondary small"
          disabled={value.length >= field.limit}
          onClick={() =>
            onChange([...value, cards ? { title: "", description: "" } : ""])
          }
        >
          <Plus size={16} />
          Add {cards ? "card" : field.multiline ? "paragraph" : "technology"}
        </button>
        <small className="field-hint">
          {value.length} / {field.limit} items
        </small>
      </fieldset>
    );
  }
  return (
    <label htmlFor={id}>
      {field.label}
      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={id === "artwork-code" ? 10 : 3}
          maxLength={field.max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type={field.type === "email" ? "email" : "text"}
          maxLength={field.max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
