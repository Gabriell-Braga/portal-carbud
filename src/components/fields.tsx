"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { digits, maskCityOrCep, maskKm, maskMoney, maskPhone } from "~/lib/format";
import { fieldBox } from "./field-box";

/*
 * Campos do portal desenhados por nós, sem a cara de cada navegador.
 * Os valores continuam indo em `name` para os formulários GET/POST de sempre;
 * máscara é só a tela — dinheiro e km vão em dígitos por um hidden.
 */

/** Fecha o popup quando o clique ou o foco vão para fora dele. */
function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: Event) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", handler);
    document.addEventListener("focusin", handler);
    return () => {
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("focusin", handler);
    };
  }, [ref, open, close]);
}

const listbox =
  "absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-lg animate-[rise_150ms_ease-out]";
const optionClass = (active: boolean, selected: boolean) =>
  `flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-sm ${active ? "bg-subtle" : ""} ${selected ? "font-semibold text-brand" : ""}`;

export type Option = { value: string; label: string };

/**
 * Select próprio (listbox ARIA). Teclado: setas, Home/End, Enter, Esc e a
 * primeira letra. `autoSubmit` reenvia o formulário ao escolher (ordenação,
 * marca → lista de modelos).
 */
export function Select({
  name,
  options,
  defaultValue = "",
  placeholder,
  label,
  autoSubmit = false,
  disabled = false,
  form,
  className = "",
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder: string;
  /** Nome acessível do botão (o rótulo visível costuma estar fora do componente). */
  label: string;
  autoSubmit?: boolean;
  disabled?: boolean;
  form?: string;
  className?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = options.find((option) => option.value === value);

  useDismiss(root, open, () => setOpen(false));

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show() {
    setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  }

  function choose(option: Option) {
    setValue(option.value);
    setOpen(false);
    if (hidden.current) hidden.current.value = option.value;
    if (autoSubmit && option.value !== value) hidden.current?.form?.requestSubmit();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }
    const moves: Record<string, number> = { ArrowDown: Math.min(active + 1, last), ArrowUp: Math.max(active - 1, 0), Home: 0, End: last };
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    } else if (event.key.length === 1) {
      const found = options.findIndex((option) => option.label.toLowerCase().startsWith(event.key.toLowerCase()));
      if (found >= 0) setActive(found);
    }
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <input ref={hidden} type="hidden" name={name} form={form} defaultValue={value} />
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`${fieldBox} justify-between gap-2 text-left disabled:cursor-not-allowed disabled:bg-subtle ${open ? "border-ink" : ""}`}
      >
        <span className={`truncate ${selected?.value ? "text-ink" : "text-muted"}`}>{selected?.value ? selected.label : placeholder}</span>
        <ChevronDown className={`size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <ul ref={list} id={`${id}-list`} role="listbox" aria-label={label} className={listbox}>
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={option.value === value}
              onPointerEnter={() => setActive(i)}
              // pointerdown no lugar de click: o foco não sai do botão antes da escolha
              onPointerDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
              className={optionClass(i === active, option.value === value)}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <Check className="size-4 shrink-0" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const MASKS = { money: maskMoney, km: maskKm, phone: maskPhone, year: (v: string) => digits(v).slice(0, 4) };

/**
 * Campo com máscara. Dinheiro e km mostram "R$ 150.000" / "50.000 km" e
 * mandam só os dígitos no `name` (é o que a busca do painel entende);
 * telefone e ano vão como aparecem.
 */
export function MaskedInput({
  mask,
  name,
  defaultValue = "",
  value,
  onValue,
  className = "",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> & {
  mask: keyof typeof MASKS;
  name?: string;
  defaultValue?: string;
  /** Controlado por fora (a faixa de preço da home); recebe e devolve dígitos. */
  value?: string;
  onValue?: (digits: string) => void;
}) {
  const format = MASKS[mask];
  const [own, setOwn] = useState(format(defaultValue));
  const shown = value !== undefined ? format(value) : own;
  const raw = mask === "money" || mask === "km";

  return (
    <>
      <input
        {...props}
        name={raw ? undefined : name}
        value={shown}
        inputMode={mask === "phone" ? "tel" : "numeric"}
        onChange={(event) => {
          const next = format(event.target.value);
          setOwn(next);
          onValue?.(digits(next));
        }}
        // apagar com o cursor depois do " km" não pode travar: tira um dígito
        onKeyDown={(event) => {
          if (mask === "km" && event.key === "Backspace" && event.currentTarget.selectionStart === shown.length) {
            event.preventDefault();
            const next = format(digits(shown).slice(0, -1));
            setOwn(next);
            onValue?.(digits(next));
          }
          props.onKeyDown?.(event);
        }}
        className={className}
      />
      {raw && name && <input type="hidden" name={name} value={digits(shown)} disabled={!digits(shown)} />}
    </>
  );
}

/**
 * "Cidade ou CEP": sugere as cidades com loja no ar e põe a máscara quando a
 * pessoa digita número. O CEP vira cidade em /comprar (ViaCEP).
 */
export function CityInput({
  cities = [],
  defaultValue = "",
  autoSubmit = false,
  id,
  className = "",
  inputClassName = "",
}: {
  cities?: string[];
  defaultValue?: string;
  autoSubmit?: boolean;
  id: string;
  className?: string;
  inputClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const term = value.trim().toLowerCase();
  const matches = /^\d/.test(term)
    ? []
    : cities.filter((city) => city.toLowerCase().includes(term) && city.split(" - ")[0].toLowerCase() !== term).slice(0, 8);
  const visible = open && matches.length > 0;

  useDismiss(root, open, () => setOpen(false));

  function choose(city: string) {
    const name = city.split(" - ")[0];
    setValue(name);
    setOpen(false);
    if (input.current) input.current.value = name;
    if (autoSubmit) input.current?.form?.requestSubmit();
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <div className={`${fieldBox} gap-2 ${inputClassName}`}>
        <MapPin className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          ref={input}
          id={id}
          name="cidade"
          value={value}
          placeholder="Cidade ou CEP"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={`${id}-list`}
          aria-activedescendant={visible && active >= 0 ? `${id}-${active}` : undefined}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setValue(maskCityOrCep(event.target.value));
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (!visible) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const step = event.key === "ArrowDown" ? 1 : -1;
              setActive((active + step + matches.length) % matches.length);
            } else if (event.key === "Enter" && active >= 0) {
              event.preventDefault();
              choose(matches[active]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-muted"
        />
      </div>
      {visible && (
        <ul id={`${id}-list`} role="listbox" aria-label="Cidades" className={listbox}>
          {matches.map((city, i) => (
            <li
              key={city}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              onPointerEnter={() => setActive(i)}
              onPointerDown={(event) => {
                event.preventDefault();
                choose(city);
              }}
              className={optionClass(i === active, false)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
