---
title: "Fine-Tuning vs RAG for Cardiology QA: Lessons from My Master's Thesis"
excerpt: "A controlled comparison of QLoRA fine-tuning and retrieval-augmented generation using an open-weight LLM, a cardiology QA corpus, and one shared benchmark."
type: project
tags: [large-language-models, fine-tuning, qlora, rag, cardiology]
cover_image: /assets/images/posts/adapting-large-language-models-for-patient-support/cover.png
cover_image_alt: "Title slide for the master's thesis Adapting Large Language Models for Patient Support"
repository_url: https://github.com/kostasfot/llm-finetuning
date: 2026-08-02 12:00:00 +0300
published: true
---

For my Master's thesis in Business Analytics and Data Science at the University of Macedonia, I explored a practical question: **can a resource-efficient adaptation method improve an open-weight language model on specialized cardiology questions, and does retrieval make it better?**

To answer it, I built an end-to-end experimental pipeline around LLaMA 3.1 8B Instruct. I created a cardiology question-answering corpus, fine-tuned the model with QLoRA, implemented a record-level retrieval-augmented generation (RAG) system, and evaluated six configurations under the same benchmark, prompts, decoding settings, and metrics.

> **The short version:** QLoRA fine-tuning delivered the strongest result, raising accuracy from 48.78% to 51.45%. The first RAG design did not improve aggregate accuracy. The main lesson was not that retrieval is ineffective, but that retrieval quality, document granularity, and context design determine whether extra information helps or distracts the model.

This post explains how the experiment was designed, what I observed, and what I would change in the next iteration.

## The research question

Medical LLMs can produce fluent answers, but fluency is not the same as reliable domain knowledge. Comparisons between adaptation methods are also difficult when studies change the model, dataset, prompt, benchmark, or decoding settings at the same time.

I therefore framed a controlled research question:

> Can resource-efficient fine-tuning and retrieval augmentation improve unseen cardiology multiple-choice performance when every system shares the same model, benchmark, prompt constraints, and decoding settings?

The scope was intentionally narrow. This was an educational research prototype for controlled question answering, not a clinical decision-support system and not evidence of safety for patient care.

## Building the cardiology QA corpus

The data pipeline started with two cardiology textbooks in PDF form. After OCR and image removal, I retained the document structure in Markdown and used source-specific parsers to match questions, answer choices, correct answers, and explanations.

The resulting records were cleaned, normalized, enriched with metadata, and validated. This produced **1,543 QA records**:

- 1,234 training records
- 154 validation records
- 155 internally held-out records

The source distribution was 1,110 records from *Interventional Cardiology* and 433 from *Braunwald Review and Assessment*. The external benchmark contained 449 questions and was excluded from both training and the retrieval index to reduce leakage risk.

![Dataset construction pipeline from two cardiology textbooks to the fine-tuning and RAG corpora](/assets/images/posts/adapting-large-language-models-for-patient-support/dataset-pipeline.png)

*The same enriched corpus supported two representations: a two-message JSONL dataset for fine-tuning and a metadata-rich JSONL corpus for retrieval.*

## Resource-efficient adaptation with QLoRA

Full fine-tuning of an 8-billion-parameter model is expensive. I used QLoRA instead: the base checkpoint remained quantized to 4-bit weights while low-rank adapters were trained across the attention and MLP projection layers.

Three predefined configurations varied the LoRA rank, learning rate, and number of epochs. All other important conditions remained fixed.

| Run | Rank | Learning rate | Epochs | Training loss | Validation loss | Accuracy | Runtime |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| FT-1 | 16 | 2e-4 | 2 | 1.3974 | **1.3871** | **51.45%** | 18.10 min |
| FT-2 | 16 | 2e-4 | 3 | **1.3051** | 1.4264 | 50.33% | 27.26 min |
| FT-3 | 32 | 1e-4 | 3 | 1.3183 | 1.4141 | 50.11% | 27.27 min |

FT-2 and FT-3 achieved lower training loss, but their validation loss was higher and their external benchmark accuracy was lower. The additional epoch increased runtime by roughly 50.7% without improving generalization.

![Scatter plot of validation loss against external benchmark accuracy for FT-1, FT-2, and FT-3](/assets/images/posts/adapting-large-language-models-for-patient-support/validation-vs-accuracy.png)

*FT-1 occupied the favourable part of the comparison: the lowest validation loss and the highest benchmark accuracy among the three controlled runs.*

FT-1 was selected as the final adapter. This selection should still be interpreted cautiously because the external benchmark provided secondary evidence during model selection and was later used for the final system comparison. A stricter follow-up would reserve an untouched benchmark for final reporting.

## Designing the RAG experiment

For retrieval, each enriched QA record became one document. I generated normalized embeddings with a BGE English embedding model and stored them in a persistent ChromaDB cosine-distance index.

At evaluation time, each benchmark question was embedded and used to retrieve either the top three or top five records. The retrieved context was capped at 3,000 characters per record and 12,000 characters overall before being added to the prompt for either the base generator or FT-1.

![Architecture of the offline index and online RAG evaluation pipeline](/assets/images/posts/adapting-large-language-models-for-patient-support/rag-pipeline.png)

*The benchmark itself was never indexed. Dataset and index fingerprints were stored to make the retrieval run traceable.*

This produced six systems for comparison:

1. Base model
2. Fine-tuned model (FT-1)
3. Base model with RAG at k=3
4. Base model with RAG at k=5
5. FT-1 with RAG at k=3
6. FT-1 with RAG at k=5

Every system answered the same 449 questions with deterministic decoding, a maximum of eight generated tokens, and letter-only answer extraction from A to E. Invalid outputs stayed in the denominator and counted as incorrect.

## Results: fine-tuning led the comparison

FT-1 produced the strongest aggregate result. It answered 231 questions correctly, compared with 219 for the base model: **12 additional correct answers**, an absolute gain of **2.67 percentage points** and a relative accuracy increase of approximately **5.48%**.

| System | Accuracy | Correct | Macro F1 | Weighted F1 | Invalid | Mean generation time |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Base | 48.78% | 219 | 0.4835 | 0.4870 | 0 | **0.165 s** |
| **Fine-tuned (FT-1)** | **51.45%** | **231** | **0.5109** | **0.5134** | 2 | 0.411 s |
| Base + RAG (k=3) | 45.66% | 205 | 0.4491 | 0.4515 | 0 | 0.478 s |
| Base + RAG (k=5) | 44.77% | 201 | 0.4308 | 0.4334 | 0 | 0.642 s |
| Fine-tuned + RAG (k=3) | 50.78% | 228 | 0.4996 | 0.5032 | 0 | 0.710 s |
| Fine-tuned + RAG (k=5) | 50.56% | 227 | 0.5054 | 0.5057 | 0 | 0.860 s |

The accuracy, macro F1, and weighted F1 results moved in the same direction. That consistency reduces the likelihood that FT-1's gain came only from the frequency of particular answer letters.

The improvement was real within this experiment, but bounded. FT-1 still answered 218 questions incorrectly, including two invalid outputs, and no statistical significance test or confidence interval was calculated. I therefore treat the result as descriptive evidence for this benchmark, not as a guarantee of performance elsewhere.

## Why did retrieval not help?

None of the RAG configurations surpassed its matching non-RAG generator.

- For the base model, RAG reduced accuracy by 3.12 percentage points at k=3 and by 4.01 points at k=5.
- For FT-1, the decline was smaller: 0.67 points at k=3 and 0.89 points at k=5.
- Increasing retrieval depth from three to five records reduced accuracy for both generators.

The fine-tuned model appeared more robust to retrieved context, but it did not use that context to exceed its non-RAG score.

The corpus design offers a plausible explanation. Each retrieval unit was a complete QA record, potentially containing another question, several answer options, a correct answer letter, and an explanation. A semantically related record could add useful cardiology knowledge, but it could also introduce competing answer cues or details that were not directly relevant to the benchmark question. Retrieving five records increased the opportunity for this contextual noise.

![Stacked bars showing the source-book share of retrieved contexts at k=3 and k=5](/assets/images/posts/adapting-large-language-models-for-patient-support/retrieval-source-share.png)

*Retrieval drew from both source books, but source coverage alone did not measure whether an individual context provided the right evidence for a question.*

This is the result that most changed how I think about RAG: **retrieval is a system-design problem, not an automatic accuracy upgrade**. A vector database can return similar text and still fail to return the evidence the generator needs.

## Aggregate accuracy hid subject-level trade-offs

The effects were not uniform across cardiology subjects. Fine-tuning showed its largest visible gains in arrhythmias and systemic hypertension/hypotension, while performance fell in some smaller categories, including miscellaneous cardiovascular topics and pericardial disease.

![Heatmap of accuracy by cardiology subject across the six evaluated systems](/assets/images/posts/adapting-large-language-models-for-patient-support/subject-accuracy-heatmap.png)

*Subject groups had different sample sizes, so these subgroup results are descriptive. Smaller categories carry greater uncertainty.*

This matters in medical QA: a higher average does not imply that a model became uniformly more reliable. Subgroup evaluation is essential for seeing where an adaptation helps, where it is neutral, and where it may make performance worse.

## Accuracy also had a latency cost

Mean model-generation time increased from 0.165 seconds per question for the base model to 0.411 seconds for FT-1. Adding retrieval context raised generation time further, reaching 0.860 seconds for FT-1 with RAG at k=5.

These measurements covered only `model.generate`. They excluded query embedding, vector search, context processing, and assembly, so they are not end-to-end RAG latency measurements. Even with that boundary, the experiment showed the cost of longer prompts: the slowest configuration was approximately 5.21 times slower than the base model without improving accuracy.

## What I would do next

The first iteration produced a reproducible foundation and a clear list of better next experiments:

- Replace record-level QA retrieval with paragraph-level textbook and guideline passages.
- Remove or mask answer letters and distractor options when QA records are indexed.
- Compare biomedical embeddings with the general BGE model.
- Add hybrid lexical-dense retrieval and a medical reranker.
- Label retrieval relevance separately from final answer correctness.
- Reserve an untouched benchmark after adapter, prompt, and RAG selection.
- Add confidence intervals, paired tests, calibration analysis, and clinician review.
- Measure end-to-end latency, memory, energy consumption, and serving cost.

## Final takeaway

Under identical evaluation conditions, QLoRA fine-tuning was the most effective adaptation strategy in this study. It delivered a modest but consistent improvement using a locally trainable adapter and limited computational resources.

RAG remained valuable as an engineering direction, but this record-level implementation demonstrated why retrieval must be evaluated rather than assumed to help. More context was not automatically better context.

Most importantly, benchmark accuracy on exam-style cardiology questions is not evidence of clinical safety. The work is an educational research prototype and should be read as an experiment in model adaptation, retrieval design, and reproducible evaluation.

The implementation, configurations, and reproducibility materials are available in the [project repository](https://github.com/kostasfot/llm-finetuning).

### Methodological references

- Hu et al. (2021), *LoRA: Low-Rank Adaptation of Large Language Models*.
- Dettmers et al. (2023), *QLoRA: Efficient Finetuning of Quantized LLMs*.
- Lewis et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*.
- Grattafiori et al. (2024), *The Llama 3 Herd of Models*.
