"""Adds conjugated forms to verbs in dicts/es.json. Needs verbecc, pymorphy3, lemminflect.

Spanish forms come from verbecc, Russian and English translations are inflected from the
one meaning per verb picked in sources/es/verb_senses.json.
Usage: python verb_forms.py   (from the repo root)
"""
import json
import sys
from pathlib import Path

import pymorphy3
from lemminflect import getInflection
from verbecc import CompleteConjugator

DICT = Path('data/dicts/es.json')
SENSES = Path('data/sources/es/verb_senses.json')
ES_PRONOUNS = ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos']
REFLEXIVE = ['me', 'te', 'se', 'nos', 'os', 'se']
RU_SUBJECTS = ['я', 'ты', 'он', 'мы', 'вы', 'они']
EN_SUBJECTS = ['I', 'you', 'he', 'we', 'you', 'they']
RU_PERSON = [('1per', 'sing'), ('2per', 'sing'), ('3per', 'sing'), ('1per', 'plur'), ('2per', 'plur'), ('3per', 'plur')]
RU_BE_FUTURE = ['буду', 'будешь', 'будет', 'будем', 'будете', 'будут']
BE_PRESENT = ['am', 'are', 'is', 'are', 'are', 'are']
BE_PAST = ['was', 'were', 'was', 'were', 'were', 'were']
# verbecc crashes on these regular verbs, so they are conjugated like hablar.
LIBRARY_CRASHES = {'pasar': 'pas', 'resultar': 'result'}
# Commands that nobody says, or whose Spanish meaning differs from the translation.
NO_IMPERATIVE = {'poder', 'querer', 'saber', 'tener'}

morph = pymorphy3.MorphAnalyzer()
conjugator = CompleteConjugator('es')


def ru_inflect(infinitive, tags):
    for parse in morph.parse(infinitive):
        if parse.tag.POS == 'INFN' and parse.normal_form == infinitive:
            found = parse.inflect(set(tags))
            if found:
                return found.word
    raise ValueError(f'{infinitive} {tags}')


def ru_past(infinitive, person):
    tags = {'past', 'plur'} if person >= 3 else {'past', 'masc', 'sing'}
    return ru_inflect(infinitive, tags)


def ru_present(impf, person):
    if impf == 'быть':
        return 'есть'
    pers, number = RU_PERSON[person]
    return ru_inflect(impf, {'pres', pers, number})


def ru_tense(sense, tense, person):
    impf, perf = sense['impf'], sense['perf']
    subject = RU_SUBJECTS[person]
    if tense == 'present':
        return f'{subject} {ru_present(impf, person)}'
    if tense == 'preterite':
        return f'{subject} {ru_past(perf or impf, person)}'
    if tense == 'imperfect':
        return f'{subject} {ru_past(impf, person)}'
    if impf == 'быть':
        return f'{subject} {RU_BE_FUTURE[person]}'
    return f'{subject} {RU_BE_FUTURE[person]} {impf}'


def ru_imperative(sense):
    return ru_inflect(sense['impf'], {'impr', 'sing', 'excl'}) + '!'


def en_past(base):
    head, *rest = base.split()
    return ' '.join([getInflection(head, 'VBD')[0], *rest])


def en_tense(base, tense, person):
    subject = EN_SUBJECTS[person]
    head, *rest = base.split()
    tail = ''.join(f' {word}' for word in rest)
    if tense == 'future':
        return f'{subject} will {base}'
    if base == 'be':
        form = BE_PRESENT[person] if tense == 'present' else BE_PAST[person]
        return f'{subject} {form}'
    if tense == 'present':
        verb = getInflection(head, 'VBZ')[0] if person == 2 else head
        return f'{subject} {verb}{tail}'
    if tense == 'preterite':
        return f'{subject} {en_past(base)}'
    return f'{subject} used to {base}'  # Works for "know" and "want", unlike "was knowing".


def es_cell(cells, pronoun):
    for cell in cells:
        if str(getattr(cell['pr'], 'value', cell['pr'])) == pronoun:
            return cell['c'][0].split(' ', 1)[-1]  # Imperative cells have no pronoun.
    raise ValueError(pronoun)


def table(lemma):
    stem = LIBRARY_CRASHES.get(lemma)
    moods = conjugator.conjugate('hablar' if stem else lemma).get_data()['moods']
    plain = {str(getattr(m, 'value', m)): {str(getattr(t, 'value', t)): c for t, c in ts.items()} for m, ts in moods.items()}
    if stem:
        for tenses in plain.values():
            for cells in tenses.values():
                for cell in cells:
                    cell['c'] = [form.replace('habl', stem) for form in cell['c']]
    ind = plain['indicativo']
    return {
        'present': ind['presente'],
        'preterite': ind['pretérito-perfecto-simple'],
        'imperfect': ind['pretérito-imperfecto'],
        'future': ind['futuro'],
    }, plain


def imperative(plain):
    cells = plain['imperativo']['afirmativo']
    return '¡' + es_cell(cells, 'tú') + '!'


def forms_for(lemma, sense):
    reflexive = lemma.endswith('se')
    base = lemma[:-2] if reflexive else lemma
    tenses, plain = table(base)
    # Interleaved so that consecutive shows differ in both tense and person.
    out = []
    names = list(tenses)
    for step in range(6):
        for shift, tense in enumerate(names):
            person = (step + shift) % 6
            form = es_cell(tenses[tense], ES_PRONOUNS[person])
            if reflexive:
                form = f'{REFLEXIVE[person]} {form}'
            out.append({'word': form, 'tr': {'ru': ru_tense(sense, tense, person), 'en': en_tense(sense['en'], tense, person)}})
    if not reflexive and lemma not in NO_IMPERATIVE:
        out.append({'word': imperative(plain), 'tr': {'ru': ru_imperative(sense), 'en': sense['en'].capitalize() + '!'}})
    return out


def main():
    data = json.loads(DICT.read_text())
    senses = json.loads(SENSES.read_text())
    failed = []
    for entry in data:
        entry.pop('forms', None)
        sense = senses.get(entry['lemma']) if entry['pos'] == 'verb' else None
        if not sense:
            continue
        try:
            entry['forms'] = forms_for(entry['lemma'], sense)
        except Exception as err:  # A verb that can't be inflected stays infinitive only.
            failed.append(f"{entry['lemma']}: {err!r}")
    DICT.write_text(json.dumps(data, ensure_ascii=False, indent=0))
    print('verbs with forms', sum('forms' in e for e in data), 'failed', len(failed))
    print('\n'.join(failed))


if __name__ == '__main__':
    sys.exit(main())
