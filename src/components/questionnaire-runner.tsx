import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { QuestionnaireDef } from "@/lib/questionnaires-data";

interface Props {
  def: QuestionnaireDef;
  value: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
}

export function QuestionnaireRunner({ def, value, onChange }: Props) {
  const answeredCount = def.items.filter((i) => value[i.id] !== undefined).length;
  const progress = (answeredCount / def.items.length) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Sobre este questionário
          </div>
          <p className="text-sm leading-relaxed text-secondary">{def.synopsis}</p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{def.intro}</p>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {answeredCount}/{def.items.length}
          </span>
        </div>
      </div>

      {def.items.map((item, idx) => (
        <Card key={item.id} className="p-4">
          <div className="mb-3 text-sm font-medium text-secondary">
            {idx + 1}. {item.prompt}
          </div>
          <RadioGroup
            value={value[item.id]?.toString() ?? ""}
            onValueChange={(v) =>
              onChange({ ...value, [item.id]: Number(v) })
            }
          >
            {item.options.map((opt) => {
              const inputId = `${def.id}-${item.id}-${opt.value}`;
              return (
                <div key={opt.value} className="flex items-start gap-2 py-1">
                  <RadioGroupItem
                    id={inputId}
                    value={opt.value.toString()}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={inputId}
                    className="cursor-pointer text-sm font-normal leading-snug"
                  >
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </Card>
      ))}

      <p className="border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-medium">Versão validada para o português (Brasil):</span>{" "}
        {def.reference}
      </p>
    </div>
  );
}

export function useQuestionnaireAnswers() {
  return useState<Record<string, number>>({});
}
