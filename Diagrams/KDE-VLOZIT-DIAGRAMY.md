# Kde vložiť diagramy

Odporúčania pre **diplomovú prácu** a pre **projekt (README)**.

---

## A) V diplomovej práci (THESIS_TEXT / thesis.pdf)

| Diagram | Súbor | Kde vložiť v texte | Prečo |
|--------|-------|--------------------|-------|
| **Use Case** | `1-use-case-diagram.png` | **§ 4. Projektovanie** – na začiatok 4.1 alebo pred 4.3 „Biznis-logika“. | Ukazuje akérov a use cases – logicky patrí do projektovania funkcionality. |
| **State machine** (životný cyklus tendra) | `2-state-machine-diagram.png` | **§ 4.3.1 Životný cyklus tendra** – hneď za odrážkový zoznam stavov (Draft → Open → …). | Priamo ilustruje prechod stavov, o ktorých píšete. |
| **Architektúra** | `3-architecture-diagram.png` | **§ 4.1 Architektúra systému** – za prvý odsek (Frontend, Smart Contract, IPFS). | Vizualizuje tri vrstvy / komponenty systému. |
| **Sekvenčný – vytvorenie tendra** | `4-sequence-tender-creation.png` | **§ 5. Realizácia** – napr. 5.1 alebo 5.2 (vytvorenie tendra + IPFS). | Ukazuje krok za krokom vytvorenie tendra (UI → IPFS → kontrakt). |
| **ER / model dát** | `5-er-diagram.png` | **§ 4.2 Model dát** – pred alebo za podsekcie 4.2.1–4.2.3 (Tender, Bid, VendorApplication). | Doplňuje textové popisy štruktúr jedným obrázkom. |
| **Data flow** | `6-data-flow-diagram.png` | **§ 4.1 Architektúra** (vedľa alebo pod architektúrny diagram) alebo **§ 4.3 Biznis-logika**. | Ukazuje toky dát medzi používateľmi a úložiskami (blokchain, IPFS). |

**Pravidlá v texte:**

- Každú obrázok v texte **odkazovať** („Obr. 4.1 – Use Case diagram“, „Obr. 4.2 – Architektúra“).
- Krátka **popisok** pod obrázkom (čo diagram zobrazuje).
- V zozname obrázkov uviesť názov a číslo strany.

---

## B) V projekte (README, dokumentácia)

| Kde | Čo vložiť | Účel |
|-----|-----------|------|
| **README.md** – sekcia „Architektúra“ alebo „Štruktúra projektu“ | `3-architecture-diagram.png` | Rýchly prehľad pre toho, kto otvorí repozitár. |
| **README.md** – sekcia „Používatelia / roly“ | `1-use-case-diagram.png` | Kto čo môže robiť (Pozorovateľ, Dodávateľ, Rada). |
| **README.md** – sekcia „Životný cyklus tendra“ alebo „Stavy“ | `2-state-machine-diagram.png` | Ako sa mení stav tendra (Draft → … → Fulfilled). |
| **docs/** (ak existuje) alebo **Diagrams/README** | Odkazy na všetky diagramy + krátky popis | Jedno miesto pre všetky diagramy pre tím / oponentov. |

Príklad úryvku do README:

```markdown
## Architektúra

![Architektúra systému](Diagrams/3-architecture-diagram.png)

## Roly a use cases

![Use Case diagram](Diagrams/1-use-case-diagram.png)
```

---

## C) Zhrnutie – „kde čo“

| # | Diagram | Diplom: kapitola | Projekt |
|---|---------|-------------------|---------|
| 1 | Use Case | § 4 (Projektovanie), pri 4.1/4.3 | README – roly / use cases |
| 2 | State machine | § 4.3.1 Životný cyklus tendra | README – stavy tendra |
| 3 | Architektúra | § 4.1 Architektúra | README – architektúra |
| 4 | Sekvenčný (vytvorenie tendra) | § 5 Realizácia (5.1/5.2) | Voliteľne docs/ |
| 5 | ER diagram | § 4.2 Model dát | Voliteľne README – dátový model |
| 6 | Data flow | § 4.1 alebo 4.3 | Voliteľne README / docs |
```

Ak chcete, môžem pripraviť konkrétne vety do THESIS_TEXT.md („Obr. 4.1 zobrazuje…“) alebo navrhnúť presné miesta v LaTeX/Word šablone.
