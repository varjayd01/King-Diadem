class Council:

    members=[

        "Altair",
        "Vega",
        "Lyla",
        "Titan",
        "DriftZero",
        "FATE",
        "Pratitya"

    ]

    def deliberate(self,question):

        opinions={}

        for m in self.members:

            opinions[m]=self.analyze(m,question)

        return opinions


    def analyze(self,member,question):

        roles={

        "Altair":"strategic reasoning",

        "Vega":"risk stability",

        "Lyla":"possibility exploration",

        "Titan":"structural reasoning",

        "DriftZero":"logic drift check",

        "FATE":"decision structure",

        "Pratitya":"cause effect chain"

        }

        return f"{member}: {roles[member]}"
