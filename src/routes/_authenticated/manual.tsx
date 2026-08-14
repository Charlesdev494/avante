import { createFileRoute } from "@tanstack/react-router";
import { ClinicLayout } from "@/components/clinic-layout";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/manual")({
  head: () => ({
    meta: [
      { title: "Manual de uso — A.V.A.N.T.E." },
      {
        name: "description",
        content:
          "Guia prático para médicos colaboradores: como cadastrar pacientes, enviar questionários e acompanhar a evolução no A.V.A.N.T.E.",
      },
    ],
  }),
  component: ManualPage,
});

const SECTIONS = [
  { id: "sobre", label: "1. O que é o A.V.A.N.T.E." },
  { id: "acesso", label: "2. Como acessar" },
  { id: "cadastro", label: "3. Cadastrando um paciente" },
  { id: "instrumentos", label: "4. Instrumentos disponíveis" },
  { id: "envio", label: "5. Enviando o link ao paciente" },
  { id: "evolucao", label: "6. Acompanhando a evolução" },
  { id: "boas-praticas", label: "7. Boas práticas no uso clínico" },
  { id: "suporte", label: "8. Suporte e feedback" },
];

const INSTRUMENTS: Array<[string, string, string]> = [
  ["EVA", "Escala Visual Analógica", "Intensidade da dor 0–10"],
  ["Mapa", "Mapa da Dor", "Paciente pinta áreas doloridas (frente/costas)"],
  ["PCS", "Catastrofização da Dor", "Ruminação, magnificação, desesperança (0–52)"],
  ["NDI", "Incapacidade Cervical", "Incapacidade por cervicalgia (0–100%)"],
  ["ODI", "Oswestry", "Incapacidade lombar (0–100%)"],
  ["RMDQ", "Roland-Morris", "Incapacidade lombar Sim/Não (0–24)"],
  ["TSK", "Cinesiofobia (TSK-17)", "Medo do movimento (17–68)"],
  ["DN4", "Dor Neuropática", "Triagem ≥ 4 sugere neuropática"],
  ["HADS", "Ansiedade e Depressão", "Subescalas A e D (0–21 cada)"],
  ["HOOS", "Quadril", "5 subescalas (0–100)"],
  ["FIQR", "Fibromialgia Revisado", "Função, impacto e sintomas (0–100)"],
  ["SPADI", "Ombro", "Dor + função (0–100)"],
  ["PPS / KPS", "Performance", "Capacidade funcional global (0–100)"],
  ["Nantes", "Neuralgia do Pudendo", "Checklist de Labat 2008"],
  ["SF-36", "Qualidade de Vida", "8 domínios (em breve)"],
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 scroll-mt-24 text-2xl font-bold text-secondary sm:text-3xl"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 text-lg font-semibold text-primary">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base leading-relaxed text-foreground">{children}</p>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-md border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm text-foreground">
      {children}
    </div>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-foreground marker:text-primary">
      {children}
    </ul>
  );
}

function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mt-3 list-decimal space-y-1.5 pl-6 text-base leading-relaxed text-foreground marker:font-semibold marker:text-secondary">
      {children}
    </ol>
  );
}

function ManualPage() {
  return (
    <ClinicLayout>
      <article className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-3 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary sm:text-4xl">
              Manual de uso
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Guia prático para médicos colaboradores · A.V.A.N.T.E.
            </p>
          </div>
        </header>

        <Card className="p-4">
          <div className="text-sm font-semibold text-secondary">Sumário</div>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-primary hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </Card>

        {/* 1 */}
        <H2 id="sobre">1. O que é o A.V.A.N.T.E.</H2>
        <P>
          O A.V.A.N.T.E. é uma plataforma clínica para{" "}
          <strong>acompanhamento longitudinal de pacientes com dor e perda
          funcional</strong>. Em vez de aplicar questionários apenas em
          consultório, o sistema agenda momentos pré-definidos (tipicamente{" "}
          <strong>D0, D30 e D90</strong>) e consolida automaticamente os
          resultados em gráficos e narrativas comparativas.
        </P>
        <H3>Para que serve</H3>
        <UL>
          <li>Documentar a evolução da dor e da função ao longo do tratamento.</li>
          <li>Padronizar a coleta de escalas validadas (EVA, SF-36, PCS, ODI, NDI, TSK, HADS, DN4 e outras).</li>
          <li>Gerar relatórios prontos para anexar ao prontuário ou compartilhar com o paciente.</li>
          <li>Reduzir o tempo de consulta dedicado ao preenchimento de questionários em papel.</li>
        </UL>
        <H3>Principais recursos</H3>
        <UL>
          <li>Cadastro de pacientes com agenda automática de reavaliações.</li>
          <li>16+ instrumentos validados, incluindo Mapa da Dor interativo (paciente pinta as áreas no celular).</li>
          <li>Termômetro EVA gráfico e comparativo entre D0, D30 e D90.</li>
          <li>Análise por IA (Kinesio AI) com narrativa clínica da evolução.</li>
          <li>Lixeira com restauração de pacientes excluídos.</li>
        </UL>

        {/* 2 */}
        <H2 id="acesso">2. Como acessar</H2>
        <P>
          Esta é uma versão de <strong>testes</strong>. Não há cadastro nem senha
          individual — o acesso é direto pelo navegador (computador, tablet ou celular).
        </P>
        <Note>
          <strong>Link de acesso:</strong>{" "}
          <a
            href="https://journey-pain-compass.lovable.app"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            journey-pain-compass.lovable.app
          </a>
        </Note>
        <H3>Selecionando seu nome</H3>
        <P>
          No topo da tela há um seletor com a lista de médicos cadastrados.{" "}
          <strong>Selecione o seu nome antes de começar.</strong> Todos os pacientes
          que você cadastrar ficarão vinculados ao seu nome — outros médicos não
          veem seus pacientes na listagem.
        </P>
        <P>
          Médicos disponíveis hoje: Dr. Charles Oliveira, Dra. Joseane Cristina
          Silva Santos, Dr. Vitto Bruce Fernandes. Para incluir um novo nome,
          basta solicitar.
        </P>

        {/* 3 */}
        <H2 id="cadastro">3. Cadastrando um paciente</H2>
        <P>
          No menu superior clique em <strong>Pacientes → Novo paciente</strong>{" "}
          (ou no botão <strong>“+ Novo paciente”</strong> da tela inicial).
        </P>
        <H3>Passo a passo</H3>
        <OL>
          <li><strong>Dados do paciente:</strong> nome completo (obrigatório), data de nascimento, telefone e observações.</li>
          <li><strong>Data D0:</strong> data de referência da avaliação inicial. Por padrão vem preenchida com a data de hoje.</li>
          <li><strong>Selecione os questionários</strong> que deseja aplicar (EVA e Mapa da Dor vêm marcados por padrão).</li>
          <li><strong>Selecione os momentos de reavaliação:</strong> D0, D30 e D90 (pode marcar apenas alguns).</li>
          <li>Clique em <strong>Salvar paciente</strong>. O sistema cria automaticamente um link de resposta para cada combinação de questionário × dia.</li>
        </OL>
        <Note>
          <strong>Dica:</strong> não é preciso o paciente estar presente. Os
          links podem ser enviados depois, via WhatsApp ou e-mail, no dia em
          que vencerem.
        </Note>

        {/* 4 */}
        <H2 id="instrumentos">4. Instrumentos disponíveis</H2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-secondary-foreground">
                <th className="px-3 py-2 text-left font-semibold">Sigla</th>
                <th className="px-3 py-2 text-left font-semibold">Nome</th>
                <th className="px-3 py-2 text-left font-semibold">Para que serve</th>
              </tr>
            </thead>
            <tbody>
              {INSTRUMENTS.map(([sigla, nome, desc], i) => (
                <tr
                  key={sigla}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/40"}
                >
                  <td className="border-t px-3 py-2 font-semibold">{sigla}</td>
                  <td className="border-t px-3 py-2">{nome}</td>
                  <td className="border-t px-3 py-2 text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5 */}
        <H2 id="envio">5. Enviando o link ao paciente</H2>
        <P>
          Depois de cadastrar, clique no nome do paciente para abrir a ficha.
          Cada questionário agendado aparece com um <strong>botão de copiar
          link</strong> e um botão para abrir o WhatsApp já com a mensagem
          padrão pronta.
        </P>
        <OL>
          <li>Abra a ficha do paciente em <strong>Pacientes</strong>.</li>
          <li>Na seção <strong>Avaliações pendentes</strong>, localize o questionário do dia (D0, D30 ou D90).</li>
          <li>Clique em <strong>Copiar link</strong> ou <strong>Enviar por WhatsApp</strong>.</li>
          <li>O paciente clica no link, responde pelo próprio celular e a resposta cai automaticamente no sistema.</li>
        </OL>
        <Note>
          O link é único, pessoal e não exige login do paciente. Após o envio
          da resposta, o status muda de “Pendente” para “Respondido” na ficha.
        </Note>
        <H3>Mapa da Dor — orientação ao paciente</H3>
        <UL>
          <li>Funciona melhor em celular ou tablet (toque na tela).</li>
          <li>O paciente arrasta o dedo para pintar as regiões que doem, na frente e nas costas.</li>
          <li>Há borracha para corrigir e botão para limpar tudo.</li>
          <li>Cores diferentes podem indicar intensidades distintas (vermelho = forte, amarelo = leve).</li>
        </UL>

        {/* 6 */}
        <H2 id="evolucao">6. Acompanhando a evolução</H2>
        <H3>Tela inicial</H3>
        <UL>
          <li>Resumo com total de pacientes, total de avaliações e <strong>pendências do dia</strong>.</li>
          <li>Lista das avaliações vencidas ou que vencem hoje, com acesso direto.</li>
        </UL>
        <H3>Ficha do paciente</H3>
        <UL>
          <li><strong>Termômetro EVA:</strong> gráfico comparativo da dor entre D0, D30 e D90.</li>
          <li><strong>Mapa da Dor sobreposto:</strong> visualize a evolução das regiões doloridas.</li>
          <li><strong>Gráficos por escala:</strong> SF-36, PCS, ODI, etc., quando aplicáveis.</li>
          <li><strong>Narrativa clínica (Kinesio AI):</strong> resumo automático em texto da evolução do paciente, pronto para colar no prontuário.</li>
        </UL>
        <H3>Lixeira e restauração</H3>
        <P>
          Pacientes excluídos vão para a <strong>Lixeira</strong> (botão no topo
          da lista de pacientes) e podem ser restaurados a qualquer momento —
          nenhum dado é apagado de fato.
        </P>

        {/* 7 */}
        <H2 id="boas-praticas">7. Boas práticas no uso clínico</H2>
        <UL>
          <li>Sempre confira se o <strong>seu nome está selecionado</strong> no topo antes de cadastrar.</li>
          <li>Padronize a data D0 como a data da <strong>primeira consulta ou primeiro bloqueio/procedimento</strong>.</li>
          <li>Marque sempre os três pontos (D0, D30, D90) — o sistema cuida do agendamento.</li>
          <li>Para pacientes idosos ou com pouca afinidade digital, prefira aplicar o questionário no consultório usando um tablet.</li>
          <li>Use a <strong>narrativa Kinesio AI</strong> como rascunho — sempre revise antes de incluir no prontuário.</li>
          <li>Evite cadastrar o mesmo paciente duas vezes. Em caso de dúvida, use a busca por nome.</li>
        </UL>

        {/* 8 */}
        <H2 id="suporte">8. Suporte e feedback</H2>
        <P>
          Esta é uma fase de testes. Toda observação é bem-vinda: sugestões de
          novos questionários, ajustes de interface, bugs encontrados, dúvidas
          sobre interpretação de escores. Anote os pontos durante o uso e envie
          um resumo ao final da semana de testes.
        </P>
        <Note>
          Obrigado por participar dos testes e contribuir para a evolução do A.V.A.N.T.E.
        </Note>
      </article>
    </ClinicLayout>
  );
}
