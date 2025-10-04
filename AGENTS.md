# Plik źródłowe

`./llm/requirements.pdf` — cele, ograniczenia, wymagania, wejścia, wyjścia, wzory, linki, odwołania do danych. Zawsze czytaj pierwsze.
`./llm/data.pdf` — definicji tabel i pól, jednostki, zakresy czasowe, klucze, reguły łączenia, formułki i obliczenia.

Te pliki zostały też skonwertowane do `.txt` ale preferuj `pdfgrep` na oryginalnych plikach `.pdf` jeżeli jest zainstalowany w środowisku.

# Instrukcje agenta

- Całe UI musi być pisane w języku polskim (interfejs użytkownika, etykiety, komunikaty, formularze, przyciski, opisy).
- Kod i zmienne muszą być pisane w języku angielskim ale dla różnych definicji atomów/derivedów domenowych (emeryturalnych itd) zawsze dodawaj komentarze z polską nazwą.
- Czytaj `./llm/data.pdf` albo `./llm/requirements.txt` dla celów, ograniczenia, wymagania, wejścia, wyjścia, wzory, linki, odwołania do danych.
- Czytaj `./llm/data.pdf` albo `./llm/data.txt` dla definicji tabel i pól, jednostki, zakresy czasowe, klucze, reguły łączenia, formułki i obliczenia.
- Preferuj dane z `./llm/data.pdf` ponad inne źródła.
- Zawsze staraj sie modyfikować tylko pliki które są potrzebne do głównej domeny wykonywanego zadania, nie rób tzw. drive-by zmian np. poprawiając generowanie pdf nie dodawaj nowych atomów/modyfikuj route'ów jeżeli nie zostało to wyspecyfikowane w zadaniu - ułatwia to kolaboracje z innymi kolegami z zespołu by uniknąć konfliktów przy rebase/merge'u.
- Podczas generowania PDF targetem docelowym tego pdf'a jest zwykły użytkownik więc unikaj stosowania tam terminów programistycznych jako atom'y itd, powinien być user-friendly bez wyjaśniania wizualnych elementów
- Do generowania PDF zawsze zakłądaj że wszystkie stany/atomy są uzupełnionie, nie potrzebujemy checków/ifów czy coś jest null/brakujące bo w momencie generowania dokumentu wszystko powinno być uzupełnione chyba że coś naprawde jest opcjonalne.
