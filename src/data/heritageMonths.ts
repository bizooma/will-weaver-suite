export interface HeritageObservance {
  name: string;
  category: 'Heritage' | 'Health' | 'Social Justice' | 'Environmental' | 'Professional' | 'Cultural';
  description: string;
  hashtags: string[];
  color: string;
}

export const heritageMonths: Record<number, HeritageObservance[]> = {
  1: [ // January
    {
      name: "National Mentoring Month",
      category: "Professional",
      description: "Celebrates the impact of mentoring and encourages mentorship",
      hashtags: ["#MentoringMonth", "#BeMentor", "#MentorshipMatters"],
      color: "hsl(var(--primary))"
    },
    {
      name: "Thyroid Awareness Month",
      category: "Health",
      description: "Raises awareness about thyroid diseases and disorders",
      hashtags: ["#ThyroidAwareness", "#ThyroidHealth", "#HealthAwareness"],
      color: "hsl(var(--destructive))"
    },
    {
      name: "National Slavery and Human Trafficking Prevention Month",
      category: "Social Justice",
      description: "Focuses on ending modern slavery and human trafficking",
      hashtags: ["#EndTrafficking", "#HumanRights", "#FreedomFirst"],
      color: "hsl(var(--secondary))"
    }
  ],
  2: [ // February
    {
      name: "Black History Month",
      category: "Heritage",
      description: "Celebrates African American history and achievements",
      hashtags: ["#BlackHistoryMonth", "#BHM", "#BlackExcellence"],
      color: "hsl(var(--primary))"
    },
    {
      name: "American Heart Month",
      category: "Health",
      description: "Promotes heart health and cardiovascular disease awareness",
      hashtags: ["#HeartMonth", "#HeartHealth", "#GoRed"],
      color: "hsl(var(--destructive))"
    },
    {
      name: "Teen Dating Violence Awareness Month",
      category: "Social Justice",
      description: "Educates about healthy relationships and dating violence prevention",
      hashtags: ["#TDVAM", "#HealthyRelationships", "#LoveIsRespect"],
      color: "hsl(var(--secondary))"
    }
  ],
  3: [ // March
    {
      name: "Women's History Month",
      category: "Heritage",
      description: "Honors women's contributions to history and society",
      hashtags: ["#WomensHistoryMonth", "#WHM", "#HerStory"],
      color: "hsl(var(--primary))"
    },
    {
      name: "Irish-American Heritage Month",
      category: "Heritage",
      description: "Celebrates Irish-American culture and contributions",
      hashtags: ["#IrishAmericanHeritage", "#IrishPride", "#Sláinte"],
      color: "hsl(210 40% 50%)"
    },
    {
      name: "Colorectal Cancer Awareness Month",
      category: "Health",
      description: "Promotes screening and prevention of colorectal cancer",
      hashtags: ["#ColorectalCancer", "#GetScreened", "#BlueForColon"],
      color: "hsl(var(--destructive))"
    }
  ],
  4: [ // April
    {
      name: "Autism Awareness Month",
      category: "Health",
      description: "Increases understanding and acceptance of autism",
      hashtags: ["#AutismAwareness", "#LightItUpBlue", "#AutismAcceptance"],
      color: "hsl(210 100% 50%)"
    },
    {
      name: "Sexual Assault Awareness Month",
      category: "Social Justice",
      description: "Promotes prevention and survivor support",
      hashtags: ["#SAAM", "#SexualAssaultAwareness", "#ConsentMatters"],
      color: "hsl(var(--secondary))"
    },
    {
      name: "Arab American Heritage Month",
      category: "Heritage",
      description: "Celebrates Arab American culture and contributions",
      hashtags: ["#ArabAmericanHeritage", "#AAHM", "#ArabPride"],
      color: "hsl(var(--primary))"
    }
  ],
  5: [ // May
    {
      name: "Asian American and Pacific Islander Heritage Month",
      category: "Heritage",
      description: "Celebrates AAPI culture, history, and contributions",
      hashtags: ["#AAPIHeritageMonth", "#AANHPI", "#AAPIStrong"],
      color: "hsl(var(--primary))"
    },
    {
      name: "Mental Health Awareness Month",
      category: "Health",
      description: "Promotes mental health education and reduces stigma",
      hashtags: ["#MentalHealthAwareness", "#MentalHealthMatters", "#EndStigma"],
      color: "hsl(120 60% 50%)"
    },
    {
      name: "National Foster Care Month",
      category: "Social Justice",
      description: "Raises awareness about children in foster care",
      hashtags: ["#FosterCareMonth", "#Foster2Belong", "#FosterCare"],
      color: "hsl(var(--secondary))"
    }
  ],
  6: [ // June
    {
      name: "Pride Month",
      category: "Social Justice",
      description: "Celebrates LGBTQ+ rights, culture, and community",
      hashtags: ["#PrideMonth", "#Pride2024", "#LoveIsLove"],
      color: "hsl(290 100% 50%)"
    },
    {
      name: "Men's Health Month",
      category: "Health",
      description: "Focuses on men's health issues and prevention",
      hashtags: ["#MensHealthMonth", "#MensHealth", "#RealMenWearGowns"],
      color: "hsl(210 100% 50%)"
    },
    {
      name: "Caribbean American Heritage Month",
      category: "Heritage",
      description: "Celebrates Caribbean American culture and contributions",
      hashtags: ["#CaribbeanHeritageMonth", "#CaribbeanPride", "#CAHM"],
      color: "hsl(var(--primary))"
    }
  ],
  7: [ // July
    {
      name: "Disability Pride Month",
      category: "Social Justice",
      description: "Celebrates disability culture and promotes inclusion",
      hashtags: ["#DisabilityPrideMonth", "#DisabilityPride", "#NothingAboutUsWithoutUs"],
      color: "hsl(var(--secondary))"
    },
    {
      name: "Park and Recreation Month",
      category: "Environmental",
      description: "Promotes parks, recreation, and conservation",
      hashtags: ["#ParkAndRecMonth", "#ParksForAll", "#GetOutside"],
      color: "hsl(120 50% 40%)"
    }
  ],
  8: [ // August
    {
      name: "Back to School Safety Month",
      category: "Professional",
      description: "Promotes safety awareness for students and families",
      hashtags: ["#BackToSchoolSafety", "#SchoolSafety", "#SafetyFirst"],
      color: "hsl(45 100% 50%)"
    },
    {
      name: "National Immunization Awareness Month",
      category: "Health",
      description: "Promotes the importance of vaccination for all ages",
      hashtags: ["#NIAM", "#VaccinesWork", "#ImmunizationAwareness"],
      color: "hsl(var(--destructive))"
    }
  ],
  9: [ // September
    {
      name: "Hispanic Heritage Month (Sept 15 - Oct 15)",
      category: "Heritage",
      description: "Celebrates Hispanic and Latino culture and contributions",
      hashtags: ["#HispanicHeritageMonth", "#HHM", "#HispanoPride"],
      color: "hsl(var(--primary))"
    },
    {
      name: "Suicide Prevention Awareness Month",
      category: "Health",
      description: "Promotes suicide prevention and mental health resources",
      hashtags: ["#SuicidePreventionMonth", "#SPAW", "#988Lifeline"],
      color: "hsl(120 60% 50%)"
    }
  ],
  10: [ // October
    {
      name: "Domestic Violence Awareness Month",
      category: "Social Justice",
      description: "Raises awareness about domestic violence prevention",
      hashtags: ["#DVAM", "#DomesticViolenceAwareness", "#PurpleThursday"],
      color: "hsl(270 100% 50%)"
    },
    {
      name: "Breast Cancer Awareness Month",
      category: "Health",
      description: "Promotes breast cancer awareness and early detection",
      hashtags: ["#BreastCancerAwareness", "#PinkOctober", "#ThinkPink"],
      color: "hsl(330 100% 70%)"
    },
    {
      name: "LGBTQ+ History Month",
      category: "Heritage",
      description: "Celebrates LGBTQ+ history and achievements",
      hashtags: ["#LGBTQHistoryMonth", "#LGBTHistory", "#OutHistory"],
      color: "hsl(290 100% 50%)"
    }
  ],
  11: [ // November
    {
      name: "Native American Heritage Month",
      category: "Heritage",
      description: "Honors Native American culture, history, and contributions",
      hashtags: ["#NativeAmericanHeritageMonth", "#NAHM", "#IndigenousPride"],
      color: "hsl(30 80% 50%)"
    },
    {
      name: "Alzheimer's Disease Awareness Month",
      category: "Health",
      description: "Raises awareness about Alzheimer's disease and caregiving",
      hashtags: ["#AlzheimersAwareness", "#EndAlz", "#AlzheimersMonth"],
      color: "hsl(270 50% 60%)"
    }
  ],
  12: [ // December
    {
      name: "Universal Human Rights Month",
      category: "Social Justice",
      description: "Promotes human rights awareness and advocacy",
      hashtags: ["#HumanRightsMonth", "#HumanRightsDay", "#StandUp4HumanRights"],
      color: "hsl(var(--secondary))"
    },
    {
      name: "Safe Toys and Gifts Month",
      category: "Professional",
      description: "Promotes toy safety and consumer awareness",
      hashtags: ["#ToysSafety", "#SafeToys", "#HolidaySafety"],
      color: "hsl(45 100% 50%)"
    }
  ]
};

export function getHeritageMonthsForDate(date: Date): HeritageObservance[] {
  const month = date.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  return heritageMonths[month] || [];
}