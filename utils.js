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
    bibtexText = bibtexText.replace(/\n/g, '<br>');
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

    if (fullName.includes(',')) {
        [last, first] = fullName.split(',').map(s => s.trim());
    } else {
        const parts = fullName.trim().split(/\s+/);
        first = parts.slice(0, -1).join(' ');
        last = parts[parts.length - 1];
    }
    return `${first[0]}. ${last}`;
}

function eliminateSpace(fullName) {
    let first = "";
    let last = "";

    if (fullName.includes(' ')) {
        [last, first] = fullName.split(' ').map(s => s.trim());
        return `${last}${first}`;
    } else {
        return fullName;
    }
}

function formatMyName(name) {
    name.includes(myFirstName) || name.includes(myLastName)
    ? `<strong><u>${formatted}</u></strong>`
    : formatted;
}

function formatAuthors(authorStr, presenter=-1) {
    const names = authorStr.split(" and ").map((name, index) => {
        let formatted = toInitials(name);
        if (index === presenter - 1) {
            formatted = formatted + "*";
        }
        return name.includes(myLastName)
        ? `<strong><u>${formatted}</u></strong>`
        : formatted;
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
        if (index === presenter - 1) {
            formatted = formatted + "*";
        }
        return name.includes(myFirstNameJP) || name.includes(myLastNameJP)
        ? `<strong><u>${formatted}</u></strong>`
        : formatted;
    });

    if (names.length === 1) {
        return names[0];
    }
    return `${names.join("，")}`;
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

function main(bibtexText, id) {
    const entries = bibtexParse(bibtexText);
    const container = document.getElementById(id);

    const ol = document.createElement("ol");
    container.appendChild(ol);

    if (id === "arXiv") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author);
            
            const li = document.createElement("li");
            li.className = "publication";
            li.innerHTML = `
                <div class="author">${authors || ""},</div>
                <div class="title">&ldquo;${entry.entryTags.title || ""},&rdquo;</div>
                <span class="journal">${entry.entryTags.journal || entry.entryTags.booktitle || ""} </span>
                <span class="year">(${entry.entryTags.year || ""})</span>
                ${entry.entryTags.url ? `<span class="url"><a href="${entry.entryTags.url}" target="_blank"> [pdf]</a>.</span>` : " ."}
            `.replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "journal_paper") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author);
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
                <div class="title">&ldquo;${entry.entryTags.title || ""},&rdquo;</div>
                <span class="journal">${entry.entryTags.journal || entry.entryTags.booktitle || ""} </span>
                <span class="volume">${entry.entryTags.volume || ""}</span>
                <span class="number">${entry.entryTags.number ? `(${entry.entryTags.number}), ` : `, `}</span>
                <span class="pages">${entry.entryTags.pages ? `${pages} ` : ` `}</span>
                <span class="year">(${entry.entryTags.year || ""}) </span>
                ${entry.entryTags.url ? `<span class="url"><a href="${entry.entryTags.url}" target="_blank">[Journal]</a> </span>` : " "}
                ${entry.entryTags.arxiv ? `<span class="url"><a href="${entry.entryTags.arxiv}" target="_blank">[arXiv]</a>.</span>` : "."}
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "conference_paper") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author);
            const pages = formatPages(entry.entryTags.pages);
            
            const li = document.createElement("li");
            li.className = "publication";

            li.innerHTML = (`
                <div class="author">${authors || ""},</div>
                <div class="title">&ldquo;${entry.entryTags.title || ""},&rdquo;</div>
                <span class="journal">${entry.entryTags.journal || entry.entryTags.booktitle || ""}, </span>
                <span class="pages">${entry.entryTags.pages ? `${pages} ` : ` `}</span>
                <span class="year">(${entry.entryTags.year || ""}) </span>
                ${entry.entryTags.url ? `<span class="url"><a href="${entry.entryTags.url}" target="_blank">[pdf]</a>.</span>` : "."}
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "international_conference") {
        entries.forEach(entry => {
            const authors = formatAuthors(entry.entryTags.author, entry.entryTags.presenter);
            
            const li = document.createElement("li");
            li.className = "presentation";

            li.innerHTML = (`
                <div class="author">${authors || ""},</div>
                <div class="title">&ldquo;${entry.entryTags.title || ""},&rdquo;</div>
                <span class="booktitle">${entry.entryTags.booktitle || ""}, </span>
                <span class="style">${entry.entryTags.style || ""}, </span>
                <span class="city">${entry.entryTags.city || ""}, </span>
                <span class="country">${entry.entryTags.country || ""} </span>
                <span class="year">(${entry.entryTags.year || ""}.</span>
                <span class="month">${entry.entryTags.month || ""}). </span>
            `).replace(/\s*\n\s*/g, "");
            ol.appendChild(li);
        });
    }
    else if (id === "domestic_workshop") {
        /*document.getElementById("domestic_workshop").textContent = JSON.stringify(entries, null, 2);*/
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