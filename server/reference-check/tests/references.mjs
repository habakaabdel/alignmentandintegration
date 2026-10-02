// Test set for the matching rule. Every "real" entry was written from the
// record Crossref returns for its DOI. `expect` is the result the tool must
// give; `titleInCrossref` says whether a work with the pasted title is there.

export const references = [
  // Real and correct.
  { id: "real-01", expect: "match", titleInCrossref: true, text: "Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. American Psychologist, 55(1), 68-78. https://doi.org/10.1037/0003-066X.55.1.68" },
  { id: "real-02", expect: "match", titleInCrossref: true, text: "Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. Qualitative Research in Psychology, 3(2), 77-101. https://doi.org/10.1191/1478088706qp063oa" },
  { id: "real-03", expect: "match", titleInCrossref: true, text: "LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature, 521(7553), 436-444. doi:10.1038/nature14539" },
  { id: "real-04", expect: "match", titleInCrossref: true, text: "Tversky, A., & Kahneman, D. (1974). Judgment under uncertainty: Heuristics and biases. Science, 185(4157), 1124-1131." },
  { id: "real-05", expect: "match", titleInCrossref: true, text: "Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. Psychological Review, 84(2), 191-215." },
  { id: "real-06", expect: "match", titleInCrossref: true, text: "Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human Decision Processes, 50(2), 179-211. https://doi.org/10.1016/0749-5978(91)90020-T" },
  { id: "real-07", expect: "match", titleInCrossref: true, text: "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606-613." },
  { id: "real-08", expect: "match", titleInCrossref: true, text: "Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097." },
  { id: "real-09", expect: "match", titleInCrossref: true, text: "Page, M. J., McKenzie, J. E., Bossuyt, P. M., Boutron, I., Hoffmann, T. C., Mulrow, C. D., et al. (2021). The PRISMA 2020 statement: An updated guideline for reporting systematic reviews. BMJ, 372, n71. https://doi.org/10.1136/bmj.n71" },
  { id: "real-10-typos", expect: "match", titleInCrossref: true, text: "Hsieh, H.-F., & Shannon, S. E. (2005). Three approaches to qualitatve content analysys. Qualitative Health Research, 15(9), 1277-1288." },
  { id: "real-11", expect: "match", titleInCrossref: true, text: "Love, P. E. D. (2002). Influence of project type and procurement method on rework costs in building construction projects. Journal of Construction Engineering and Management, 128(1), 18-29. https://doi.org/10.1061/(ASCE)0733-9364(2002)128:1(18)" },
  { id: "real-12-mla", expect: "match", titleInCrossref: true, text: "Ioannidis, John P. A. “Why Most Published Research Findings Are False.” PLoS Medicine, vol. 2, no. 8, 2005, e124." },
  { id: "real-13", expect: "match", titleInCrossref: true, text: "Jumper, J., Evans, R., Pritzel, A., et al. (2021). Highly accurate protein structure prediction with AlphaFold. Nature, 596, 583-589." },
  { id: "real-14", expect: "match", titleInCrossref: true, text: "Ellis-Young, M., & Doucet, B. (2021). From \"big small town\" to \"small big city\": Resident experiences of gentrification along Waterloo Region's LRT corridor. Journal of Planning Education and Research. https://doi.org/10.1177/0739456X21993914" },
  { id: "real-15-british-spelling", expect: "match", titleInCrossref: true, text: "Tversky, A. and Kahneman, D. (1974) 'Judgement under uncertainty: heuristics and biases', Science, 185(4157), pp. 1124-1131." },
  { id: "real-16-words-dropped", expect: "match", titleInCrossref: true, text: "Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation and well-being. American Psychologist, 55(1), 68-78." },
  { id: "real-17-subtitle-omitted", expect: "match", titleInCrossref: true, text: "Page, M. J., McKenzie, J. E., Bossuyt, P. M., et al. (2021). The PRISMA 2020 statement. BMJ, 372, n71. https://doi.org/10.1136/bmj.n71" },
  { id: "real-18-informal", expect: "match", titleInCrossref: true, text: "Braun and Clarke 2006 Using thematic analysis in psychology" },

  // Real works with an error in the reference.
  { id: "wrong-doi-other-paper", expect: "mismatch", titleInCrossref: true, text: "Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. American Psychologist, 55(1), 68-78. https://doi.org/10.1191/1478088706qp063oa" },
  { id: "wrong-doi-not-registered", expect: "mismatch", titleInCrossref: true, text: "Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. Qualitative Research in Psychology, 3(2), 77-101. https://doi.org/10.1191/1478088706qp999zz" },
  { id: "right-doi-wrong-author", expect: "mismatch", titleInCrossref: true, text: "Skinner, B. F. (1977). Self-efficacy: Toward a unifying theory of behavioral change. Psychological Review, 84(2), 191-215. https://doi.org/10.1037/0033-295X.84.2.191" },
  { id: "right-doi-wrong-year", expect: "mismatch", titleInCrossref: true, text: "Ajzen, I. (1985). The theory of planned behavior. Organizational Behavior and Human Decision Processes, 50(2), 179-211. https://doi.org/10.1016/0749-5978(91)90020-T" },
  { id: "no-doi-wrong-author", expect: "mismatch", titleInCrossref: true, text: "Miller, J., & Carter, T. (2005). Three approaches to qualitative content analysis. Qualitative Health Research, 15(9), 1277-1288." },
  { id: "no-doi-wrong-year", expect: "mismatch", titleInCrossref: true, text: "Ioannidis, J. P. A. (2012). Why most published research findings are false. PLoS Medicine, 2(8), e124." },
  { id: "wrong-doi-other-paper-2", expect: "mismatch", titleInCrossref: true, text: "Braun, V., & Clarke, V. (2019). Reflecting on reflexive thematic analysis. Qualitative Research in Sport, Exercise and Health, 11(4), 589-597. https://doi.org/10.1177/1049732305276687" },

  // Invented for this test. None of these exists.
  { id: "invented-01", expect: "not_found_in_crossref", titleInCrossref: false, text: "Okafor, L. M., & Brandt, S. (2019). Recursive attentional scaffolding in adolescent grief counselling: A longitudinal mixed-methods study. Journal of Counseling Psychology, 66(4), 512-530. https://doi.org/10.1037/cou0009412x" },
  { id: "invented-02", expect: "not_found_in_crossref", titleInCrossref: false, text: "Whitcombe, D. R. (2021). Lunar tidal effects on municipal budgeting cycles in mid-sized Canadian cities. Canadian Public Administration, 64(2), 201-219." },
  { id: "invented-03-short-title-trap", expect: "not_found_in_crossref", titleInCrossref: false, text: "Harlan, P., & Yusuf, K. (2017). Deep learning for predicting therapist burnout from keyboard dynamics. Nature, 545, 112-118." },
  { id: "invented-04", expect: "not_found_in_crossref", titleInCrossref: false, text: "Nakamura, T., Feldt, R., & Osei, A. (2020). Thematic analysis of silence in rural telehealth supervision. Qualitative Research in Psychology, 17(3), 301-322. https://doi.org/10.1080/14780887.2020.9917345" },
  { id: "invented-05-embedded-title", expect: "not_found_in_crossref", titleInCrossref: false, text: "Delacroix, M. (2015). The theory of planned behavior applied to glacier tourism refusal among retirees. Tourism Management, 48, 77-90." },
  { id: "invented-06-colon-trap", expect: "not_found_in_crossref", titleInCrossref: false, text: "Bergstrom, H., & Li, Q. (2022). Self-efficacy: A pilot trial of harmonica instruction for long-haul truck drivers. Psychological Review, 129(1), 44-61." },
  { id: "invented-07", expect: "not_found_in_crossref", titleInCrossref: false, text: "Pemberton, A. J. (2018). Quantum entanglement as a metaphor in municipal zoning appeals. Journal of Planning Education and Research, 38(2), 150-164. https://doi.org/10.1177/0739456X18700001" },
  { id: "invented-08", expect: "not_found_in_crossref", titleInCrossref: false, text: "Varga, E., Thistlewood, N., & Abara, C. (2023). Why most published harmonica findings are transferable: evidence from eleven truck stops. PLoS Medicine, 20(3), e1004188." },
  { id: "invented-09-one-word-title-trap", expect: "not_found_in_crossref", titleInCrossref: false, text: "Quillfeather, N. (2010). Imaginary study number 10 of marmalade viscosity among lighthouse keepers. Journal of Unlikely Results, 10(2), 1-9. https://doi.org/10.1037/zzz00109412x" },
  { id: "short-title-wrong-author", expect: "not_found_in_crossref", titleInCrossref: false, text: "Marchetti, O. (2015). Deep learning. Journal of Unlikely Results, 4(1), 2-11." },

  // Real works that sit outside Crossref.
  { id: "outside-report", expect: "not_found_in_crossref", titleInCrossref: false, text: "Truth and Reconciliation Commission of Canada. (2015). Honouring the truth, reconciling for the future: Summary of the final report of the Truth and Reconciliation Commission of Canada." },
  { id: "outside-datacite-doi", expect: "not_found_in_crossref", titleInCrossref: true, text: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. arXiv. https://doi.org/10.48550/arXiv.1706.03762" },
];
