async function includeHTML(selector, file) {
    const el = document.querySelector(selector);
    if (!el) return;
    const res = await fetch(file);
    const html = await res.text();
    el.innerHTML = html;
}

const myFirstName = "Norihisa";
const myLastName = "Namura";
const myFirstNameJP = "憲尚";
const myLastNameJP = "名村";

async function loadBib(file) {
    const response = await fetch(file);
    bibtexText = await response.text();
    bibtexText = bibtexText.replace(/\n/g, "<br>");
    return bibtexText;
}

function latexToText(str) {
    if (!str) return "";

    return str
        .replace(/[{}]/g, "")
        .replace(/\\&/g, "&")
        .replace(/\\_/g, "_")
        .replace(/\\[a-zA-Z]+/g, "");
}

function bibtexParse(bib) {
    const entries = bib.split(/@/).slice(1);
    return entries.map(e => {
        const typeMatch = e.match(/^(\w+)\s*\{([^,]+),/);
        const entryTags = {};
        //e.replace(/(\w+)\s*=\s*\{([^}]*)\}/g, (_, k, v) => { entryTags[k.trim()] = latexToText(v).trim(); });
        e.replace(/(\w+)\s*=\s*\{([\s\S]*?)\},/g, (_, k, v) => { entryTags[k.trim()] = latexToText(v).trim(); });
        return { type: typeMatch ? typeMatch[1] : "", key: typeMatch ? typeMatch[2] : "", entryTags };
    });
}

function toInitials(fullName) {
    let first = "";
    let last = "";

    if (fullName.includes(",")) {
        [last, first] = fullName.split(",").map(s => s.trim());
    } else {
        const parts = fullName.trim().split(/\s+/);
        first = parts.slice(0, -1).join(" ");
        last = parts[parts.length - 1];
    }
    return `${first[0]}. ${last}`;
}

function eliminateSpace(fullName) {
    let first = "";
    let last = "";

    if (fullName.includes(" ")) {
        [last, first] = fullName.split(" ").map(s => s.trim());
        return `${last}${first}`;
    } else {
        return fullName;
    }
}

function formatAuthors(authorStr, presenter=-1) {
    const names = authorStr.split(" and ").map((name, index) => {
        let formatted = toInitials(name);
        if (name.includes(myLastName)) {
            formatted = `<strong><u>${formatted}</u></strong>`;
        }
        if (index === presenter - 1) {
            formatted = formatted + "*";
        }

        return formatted;
    });

    if (names.length === 1) {
        return names[0];
    }
    else if (names.length === 2) {
        return `${names[0]} and ${names[1]}`
    };
    return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function formatAuthorsJP(authorStr, presenter=-1) {
    const names = authorStr.split(" and ").map((name, index) => {
        let formatted = eliminateSpace(name);
        if (name.includes(myFirstNameJP) || name.includes(myLastNameJP)) {
            formatted = `<strong><u>${formatted}</u></strong>`;
        }
        if (index === presenter - 1) {
            formatted = formatted + "*";
        }

        return formatted;
    });

    if (names.length === 1) {
        return names[0];
    }
    return `${names.join("，")}`;
}

function endash(word) {
    let former = "";
    let latter = "";

    if (word.includes("--")) {
        [former, latter] = word.split("--").map(s => s.trim());
        word = `${former}&ndash;${latter}`
    }
    return word;
}

function formatTitle(titleStr) {
    const words = titleStr.split(" ").map((word) => {
        word = endash(word)
        return word;
    });
    return words.join(" ")
}

function formatPages(pageStr) {
    const pages = pageStr.split(/-+/g);

    if (pages.length === 1) {
        return pages[0];
    }
    else if (pages.length === 2) {
        return `${pages[0]}&ndash;${pages[1]}`
    };
}

function formatMonth(monthStr) {
    const monthStrLow = monthStr.trim().toLowerCase();

    if (monthStrLow.startsWith("jan")) {
        monthStr = "01";
    }
    else if (monthStrLow.startsWith("feb")) {
        monthStr = "02";
    }
    else if (monthStrLow.startsWith("mar")) {
        monthStr = "03";
    }
    else if (monthStrLow.startsWith("apr")) {
        monthStr = "04";
    }
    else if (monthStrLow.startsWith("may")) {
        monthStr = "05";
    }
    else if (monthStrLow.startsWith("jun")) {
        monthStr = "06";
    }
    else if (monthStrLow.startsWith("jul")) {
        monthStr = "07";
    }
    else if (monthStrLow.startsWith("aug")) {
        monthStr = "08";
    }
    else if (monthStrLow.startsWith("sep")) {
        monthStr = "09";
    }
    else if (monthStrLow.startsWith("oct")) {
        monthStr = "10";
    }
    else if (monthStrLow.startsWith("nov")) {
        monthStr = "11";
    }
    else if (monthStrLow.startsWith("dec")) {
        monthStr = "12";
    }
    return monthStr;
}

function main(bibtexText, id) {
    const entries = bibtexParse(bibtexText);
    const container = document.getElementById(id);

    const ol = document.createElement("ol");
    container.appendChild(ol);

    if (id === "arXiv") {
        if (entries.length === 0) {
            const p = document.createElement("p");
            p.innerHTML = "&emsp;None.";
            ol.replaceWith(p);
        }
        else {
            entries.forEach(entry => {
                const authors = formatAuthors(entry.entryTags.author);
                const title = formatTitle(entry.entryTags.title);
                
                const li = document.createElement("li");
                li.className = "publication";
                li.innerHTML = `
                    <div class="author">${authors || ""},</div>
                    <div class="title">&ldquo;${title || ""},&rdquo;</div>
                    <span class="journal">${entry.entryTags.journal || entry.entryTags.booktitle || ""} </span>
                    <span class="year">(${entry.entryTags.year || ""})</span>
                    ${entry.entryTags.url ? `<span class="url"><a href="${entry.entryTags.url}" target="_blank"> [pdf]</a>.</span>` : " ."}
                `.replace(/\s*\n\s*/g, "");
                ol.appendChild(li);
            });
        };
    }
    else if (id === "journal_papers") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author);
            const title = formatTitle(entry.entryTags.title);
            const pages = formatPages(entry.entryTags.pages);
            
            const li = document.createElement("li");
            li.className = "publication";

            /*
            let item;
            item = document.createElement("span");
            item.className = "volume";
            item.textContent = `${entry.entryTags.volume}` || "";
            li.appendChild(item);
            if (entry.entryTags.number) {
            item = document.createElement("span");
            item.className = "number";
            item.textContent = `(${entry.entryTags.number}),` || ",";
            li.appendChild(item);
            }
            */

            li.innerHTML = (`
                <div class="author">${authors || ""},</div>
                <div class="title">&ldquo;${title || ""},&rdquo;</div>
                <span class="journal">${entry.entryTags.journal || entry.entryTags.booktitle || ""} </span>
                <span class="volume">${entry.entryTags.volume || ""}</span>
                <span class="number">${entry.entryTags.number ? `(${entry.entryTags.number}), ` : `, `}</span>
                <span class="pages">${entry.entryTags.pages ? `${pages} ` : ` `}</span>
                <span class="year">(${entry.entryTags.year || ""}) </span>
                ${entry.entryTags.url ? `<span class="url"><a href="${entry.entryTags.url}" target="_blank">[Journal]</a></span>` : ""}
                ${entry.entryTags.arxiv ? `<span class="url"> <a href="${entry.entryTags.arxiv}" target="_blank">[arXiv]</a>.</span>` : "."}
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "conference_papers") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author);
            const title = formatTitle(entry.entryTags.title);
            const pages = formatPages(entry.entryTags.pages);
            
            const li = document.createElement("li");
            li.className = "publication";

            li.innerHTML = (`
                <div class="author">${authors || ""},</div>
                <div class="title">&ldquo;${title || ""},&rdquo;</div>
                <span class="journal">${entry.entryTags.journal || entry.entryTags.booktitle || ""}, </span>
                <span class="pages">${entry.entryTags.pages ? `${pages} ` : ` `}</span>
                <span class="year">(${entry.entryTags.year || ""}) </span>
                ${entry.entryTags.url ? `<span class="url"><a href="${entry.entryTags.url}" target="_blank">[pdf]</a></span>` : " "}
                ${entry.entryTags.arxiv ? `<span class="url"> <a href="${entry.entryTags.arxiv}" target="_blank">[arXiv]</a>.</span>` : "."}
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "international_conference") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author, entry.entryTags.presenter);
            const title = formatTitle(entry.entryTags.title);
            const month = formatMonth(entry.entryTags.month);
            
            const li = document.createElement("li");
            li.className = "presentation";

            li.innerHTML = (`
                <div class="author">${authors || ""},</div>
                <div class="title">&ldquo;${title || ""},&rdquo;</div>
                <span class="booktitle">${entry.entryTags.booktitle || ""}, </span>
                <span class="style">${entry.entryTags.style || ""}, </span>
                <span class="city">${entry.entryTags.city || ""}, </span>
                <span class="country">${entry.entryTags.country || ""} </span>
                <span class="year">(${entry.entryTags.year || ""}.</span>
                <span class="month">${month || ""}). </span>
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "international_workshop") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author, entry.entryTags.presenter);
            const title = formatTitle(entry.entryTags.title);
            const month = formatMonth(entry.entryTags.month);
            
            const li = document.createElement("li");
            li.className = "presentation";

            li.innerHTML = (`
                <div class="author">${authors || ""},</div>
                <div class="title">&ldquo;${title || ""},&rdquo;</div>
                <span class="booktitle">${entry.entryTags.booktitle || ""}, </span>
                <span class="city">${entry.entryTags.city || ""}, </span>
                <span class="country">${entry.entryTags.country || ""} </span>
                <span class="year">(${entry.entryTags.year || ""}.</span>
                <span" class="month">${month || ""}). </span>
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "domestic_workshops") {
        entries.forEach(entry => {
            const authors = formatAuthorsJP(entry.entryTags.author, entry.entryTags.presenter);
            
            const li = document.createElement("li");
            li.className = "presentation";

            li.innerHTML = (`
                <div class="author">${authors || ""}，</div>
                <div class="title">「${entry.entryTags.title || ""}」，</div>
                <span class="booktitle">${entry.entryTags.booktitle || ""}，</span>
                <span class="style">${entry.entryTags.city ? `${entry.entryTags.style}，${entry.entryTags.city} ` : `${entry.entryTags.style} `}</span>
                <span class="year">(${entry.entryTags.year || ""}.</span>
                <span class="month">${entry.entryTags.month || ""})．</span>
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
}