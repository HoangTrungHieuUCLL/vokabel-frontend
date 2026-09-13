import type { TranslationKey } from '../i18n/translations'

export interface Bilingual {
  de: string
  en: string
}

export interface GrammarExample {
  de: string
  en: string
}

export type GrammarBlock =
  | { type: 'p'; text: Bilingual }
  | { type: 'examples'; items: GrammarExample[] }

export interface GrammarTopic {
  id: string
  titleKey: TranslationKey
  blocks: GrammarBlock[]
}

function p(de: string, en: string): GrammarBlock {
  return { type: 'p', text: { de, en } }
}

function ex(...items: GrammarExample[]): GrammarBlock {
  return { type: 'examples', items }
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'praeteritum',
    titleKey: 'grammar.praeteritum.title',
    blocks: [
      p(
        'Das Präteritum ist die Erzählzeit der Vergangenheit -- typisch für Berichte, Nachrichten und geschriebene Texte. Im gesprochenen Deutsch wird meist das Perfekt bevorzugt, außer bei haben, sein, den Modalverben und ein paar sehr häufigen Verben (wissen, es gibt), wo auch im Gespräch das Präteritum normal ist.',
        'The Präteritum is the narrative past tense -- typical for reports, news, and written text. In spoken German, Perfekt is usually preferred instead, except for haben, sein, the modal verbs, and a few very common verbs (wissen, es gibt), where Präteritum is normal even in conversation.',
      ),
      p(
        'Regelmäßige (schwache) Verben: Stamm + te (+ Endung). Unregelmäßige (starke) Verben ändern den Stammvokal und bekommen kein -te.',
        'Regular (weak) verbs: stem + te (+ ending). Irregular (strong) verbs change the stem vowel and take no -te.',
      ),
      ex(
        { de: 'Ich hatte gestern keine Zeit.', en: "I didn't have time yesterday." },
        { de: 'Er ging jeden Tag zu Fuß zur Arbeit.', en: 'He walked to work every day.' },
        { de: 'Sie machte die Tür auf und lächelte.', en: 'She opened the door and smiled.' },
      ),
    ],
  },
  {
    id: 'wenn-als',
    titleKey: 'grammar.wennAls.title',
    blocks: [
      p(
        '„als" beschreibt ein einmaliges Ereignis in der Vergangenheit. „wenn" beschreibt wiederholte Ereignisse in der Vergangenheit ("jedes Mal, wenn...") oder jede Zeitangabe in Gegenwart und Zukunft, egal ob einmalig oder wiederholt.',
        '"als" describes a single, one-time event in the past. "wenn" describes repeated events in the past ("every time...") or any time reference in the present or future, whether it happens once or repeatedly.',
      ),
      ex(
        { de: 'Als ich acht Jahre alt war, sind wir nach München gezogen.', en: 'When I was eight, we moved to Munich.' },
        { de: 'Immer wenn es regnete, blieb ich zu Hause.', en: 'Whenever it rained, I stayed home.' },
        { de: 'Wenn ich morgen Zeit habe, rufe ich dich an.', en: "If/when I have time tomorrow, I'll call you." },
      ),
      p(
        'Merkhilfe: „als" = einmal, Vergangenheit. „wenn" = alles andere (Gegenwart, Zukunft, oder wiederholt in der Vergangenheit).',
        'Rule of thumb: "als" = once, past. "wenn" = everything else (present, future, or repeated in the past).',
      ),
    ],
  },
  {
    id: 'plusquamperfekt',
    titleKey: 'grammar.plusquamperfekt.title',
    blocks: [
      p(
        'Das Plusquamperfekt beschreibt eine Handlung, die vor einer anderen Handlung in der Vergangenheit passiert ist -- die "Vorvergangenheit". Es steht oft zusammen mit "nachdem".',
        'The Plusquamperfekt describes an action that happened before another past action -- a "past-before-the-past". It often appears together with "nachdem" (after).',
      ),
      p(
        'Bildung: hatte/war (Präteritum von haben/sein) + Partizip II.',
        'Formation: hatte/war (Präteritum of haben/sein) + past participle.',
      ),
      ex(
        { de: 'Nachdem ich gegessen hatte, ging ich spazieren.', en: 'After I had eaten, I went for a walk.' },
        { de: 'Sie war schon eingeschlafen, als ich nach Hause kam.', en: 'She had already fallen asleep when I came home.' },
      ),
    ],
  },
  {
    id: 'obwohl',
    titleKey: 'grammar.obwohl.title',
    blocks: [
      p(
        '„obwohl" ist eine unterordnende Konjunktion (Konzessivsatz): Sie leitet einen Nebensatz ein, das konjugierte Verb steht am Ende. Sie drückt einen Gegensatz oder eine unerwartete Konsequenz aus.',
        '"obwohl" is a subordinating conjunction (concessive clause): it introduces a subordinate clause, and the conjugated verb moves to the end. It expresses a contrast or an unexpected consequence.',
      ),
      p(
        'Unterschied zu „trotzdem" (Adverb, eigener Hauptsatz, Verb an Position 2) und „aber" (nebenordnend, verbindet zwei Hauptsätze).',
        'Different from "trotzdem" (adverb, its own main clause, verb in position 2) and "aber" (coordinating, connects two main clauses).',
      ),
      ex(
        { de: 'Obwohl es regnete, gingen wir spazieren.', en: 'Although it was raining, we went for a walk.' },
        { de: 'Es regnete. Trotzdem gingen wir spazieren.', en: 'It was raining. Nevertheless, we went for a walk.' },
        { de: 'Es regnete, aber wir gingen trotzdem spazieren.', en: 'It was raining, but we went for a walk anyway.' },
      ),
    ],
  },
  {
    id: 'relativsaetze',
    titleKey: 'grammar.relativsaetze.title',
    blocks: [
      p(
        'Das Relativpronomen richtet sich in Genus und Numerus nach dem Bezugswort (dem Nomen, auf das es sich bezieht), aber im Kasus nach seiner eigenen Funktion im Relativsatz. Das Verb steht am Ende des Relativsatzes. Die Formen selbst stehen in der Tabellen-Übersicht -- hier geht es um die Anwendung.',
        "The relative pronoun matches its antecedent (the noun it refers back to) in gender and number, but takes its case from its own role inside the relative clause. The verb moves to the end of the relative clause. The full paradigm is in the Tables tab -- this is about how to use it.",
      ),
      ex(
        { de: 'Der Mann, der dort steht, ist mein Lehrer.', en: 'The man who is standing there is my teacher. (subject -> Nominativ)' },
        { de: 'Der Mann, den ich gestern getroffen habe, ist mein Lehrer.', en: 'The man I met yesterday is my teacher. (direct object -> Akkusativ)' },
        { de: 'Die Frau, der ich geholfen habe, war sehr dankbar.', en: 'The woman I helped was very grateful. (helfen + Dativ)' },
        { de: 'Das ist der Student, dessen Laptop kaputt ist.', en: "That's the student whose laptop is broken. (possession -> Genitiv)" },
      ),
    ],
  },
  {
    id: 'passiv-modal',
    titleKey: 'grammar.passivModal.title',
    blocks: [
      p(
        'Bildung: Modalverb (konjugiert, Position 2) + ... + Partizip II + werden (Infinitiv, am Satzende). Das Modalverb macht klar: Pflicht (müssen), Erlaubnis (können/dürfen) oder Notwendigkeit -- die handelnde Person bleibt unwichtig oder unbekannt, genau wie im normalen Passiv.',
        'Formation: modal verb (conjugated, position 2) + ... + past participle + werden (infinitive, at the end of the clause). The modal verb signals obligation (müssen), permission (können/dürfen), or necessity -- the person doing the action stays unimportant or unknown, just like in a plain passive.',
      ),
      ex(
        { de: 'Aktiv: Man muss das Formular ausfüllen.', en: 'Active: You have to fill out the form.' },
        { de: 'Passiv + Modal: Das Formular muss ausgefüllt werden.', en: 'Passive + modal: The form has to be filled out.' },
        { de: 'Die Rechnung kann online bezahlt werden.', en: 'The invoice can be paid online.' },
      ),
    ],
  },
  {
    id: 'genitiv',
    titleKey: 'grammar.genitiv.title',
    blocks: [
      p(
        'Der Genitiv zeigt Besitz oder Zugehörigkeit ("wessen?") und gehört eher zur geschriebenen und formellen Sprache -- im gesprochenen Deutsch wird er oft durch "von + Dativ" ersetzt.',
        'The genitive shows possession or relation ("whose?") and belongs mostly to written and formal German -- in spoken German it is often replaced by "von + Dativ".',
      ),
      p(
        'Maskuline und neutrale Nomen im Singular bekommen die Endung -s (oder -es bei einsilbigen Wörtern): des Mannes, des Kindes. Feminine Nomen und alle Pluralformen ändern sich nicht.',
        'Masculine and neuter nouns in the singular take the ending -s (or -es for one-syllable words): des Mannes, des Kindes. Feminine nouns and all plural forms stay unchanged.',
      ),
      p(
        'Feste Genitiv-Präpositionen: während, trotz, wegen, (an)statt -- in der Umgangssprache stehen diese oft schon mit Dativ.',
        'Fixed genitive prepositions: während (during), trotz (despite), wegen (because of), (an)statt (instead of) -- in colloquial speech these are often already used with the dative instead.',
      ),
      ex(
        { de: 'Das Auto des Lehrers ist neu.', en: "The teacher's car is new." },
        { de: 'Wegen des Regens blieben wir zu Hause.', en: 'Because of the rain, we stayed home.' },
        { de: 'Umgangssprachlich: Wegen dem Regen blieben wir zu Hause.', en: 'Colloquially: Because of the rain, we stayed home.' },
      ),
    ],
  },
]
