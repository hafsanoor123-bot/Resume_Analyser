const signin = document.getElementById("signin");
signin.addEventListener("click" , function(){
    window.location.href = "signup.html";
});

const login = document.getElementById("login");
login.addEventListener("click" , function(){
    window.location.href = "login.html";
});


// Skills list
const skillsList = [
  "HTML", "CSS", "JavaScript", "React",
  "Python", "Java", "C++", "SQL",
  "Node.js", "Machine Learning", "Data Analysis",
  "PHP", "TypeScript", "Bootstrap" , "Mathematics",
   "MS Word" , "Excel" , "PowerPoint" , "React",
   "Figma" , "Git & GitHub" , "MySQL" , "MongoDB"
];

// Display selected file name
const fileInput = document.getElementById("resumeFile");
const fileNameDiv = document.getElementById("fileName");

fileInput.addEventListener("change", function() {
    const file = this.files[0];
    if(!file) return;

    fileNameDiv.textContent = "Selected File: " + file.name;

    startLoading(); 

    const type = file.type;

    if(type === "application/pdf") {
        readPDF(file);
    } else if(file.name.endsWith(".docx")) {
        readDOCX(file);
    } else if(type.startsWith("image/")) {
        readImage(file);
    } else {
        alert("Unsupported file format.");
        stopLoading();
    }
});

// For PDF
function readPDF(file) {
    const reader = new FileReader();
    reader.onload = function() {
        const typedArray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedArray).promise.then(async function(pdf) {
            let text = "";
            for(let i = 1; i <= pdf.numPages; i++){
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(" ") + " ";
            }
            processText(text);
        });
    }
    reader.readAsArrayBuffer(file);
}

// For Docx
function readDOCX(file) {
    const reader = new FileReader();
    reader.onload = function() {
        mammoth.extractRawText({ arrayBuffer: reader.result })
            .then(result => processText(result.value));
    }
    reader.readAsArrayBuffer(file);
}

// For Image
function readImage(file) {
    const reader = new FileReader();
    reader.onload = function() {
        Tesseract.recognize(reader.result, 'eng').then(({data}) => {
            processText(data.text);
        });
    }
    reader.readAsDataURL(file);
}

// For Process Text
function processText(text) {
    stopLoading();
    extractSkills(text);
}

// For Skills Extraction
// function extractSkills(text) {
//     const found = skillsList.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
//     const resultsDiv = document.getElementById("results");

//     if(found.length === 0){
//         resultsDiv.textContent = "No skills detected.";
//     } else {
//         resultsDiv.textContent = "Skills Found: " + found.join(", ");
//     }
// }

function extractSkills(text) {
    const found = skillsList.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
    );

    extractedResumeSkills = found;   // ✅ store globally

    const resultsDiv = document.getElementById("results");

    if(found.length === 0){
        resultsDiv.textContent = "No skills detected.";
    } else {
        resultsDiv.textContent = "Skills Found: " + found.join(", ");
    }
}


// Loading Function
function startLoading() {
    let loadingBox = document.getElementById("loadingBox");
    if(!loadingBox){
        // create loading box dynamically
        loadingBox = document.createElement("div");
        loadingBox.id = "loadingBox";
        loadingBox.style.width = "300px";
        loadingBox.style.border = "2px solid #555";
        loadingBox.style.padding = "15px";
        loadingBox.style.marginTop = "10px";
        loadingBox.innerHTML = `
            <p>Extracting... Please wait</p>
            <div style="width:100%; height:20px; background:#ddd; border-radius:5px; overflow:hidden;">
                <div id="progressBar" style="width:0%; height:100%; background:var(--green); transition:0.3s;"></div>
            </div>
            <p id="progressText">0%</p>
        `;
        fileInput.parentNode.appendChild(loadingBox);
    }
    loadingBox.style.display = "block";

    updateProgress(0);
    let progress = 0;
    window.loadingInterval = setInterval(() => {
        if(progress < 90){
            progress += 5;
            updateProgress(progress);
        }
    }, 200);
}

function stopLoading() {
    clearInterval(window.loadingInterval);
    updateProgress(100);
    setTimeout(() => {
        const loadingBox = document.getElementById("loadingBox");
        if(loadingBox) loadingBox.style.display = "none";
    }, 700);
}

function updateProgress(val){
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    if(progressBar) progressBar.style.width = val + "%";
    if(progressText) progressText.textContent = val + "%";
}



// Resume Skills Analyzer
const analyzeBtn = document.getElementById("analyze"); 

// analyzeBtn.addEventListener("click", function () {

//     const JDText = document.getElementById("jobDesc").value;
//     const resumeResultText = document.getElementById("results").textContent;

//     if (!JDText.trim()) {
//         alert("Please paste Job Description first!");
//         return;
//     }

//     // Resume skills already extracted and shown inside #results
//     const resumeSkills = skillsList.filter(skill =>
//         resumeResultText.toLowerCase().includes(skill.toLowerCase())
//     );

//     // Extract skills from JD
//     const jdSkills = skillsList.filter(skill =>
//         JDText.toLowerCase().includes(skill.toLowerCase())
//     );

//     // Compare results
//     const matched = resumeSkills.filter(skill => jdSkills.includes(skill));
//     const missing = jdSkills.filter(skill => !resumeSkills.includes(skill));
//     const extra = resumeSkills.filter(skill => !jdSkills.includes(skill));

//  updateAISuggestions(jdSkills, resumeSkills, matched, missing, extra);


//     // Score Calculation
//     let score = 0;

//     if (jdSkills.length > 0) {
//         score = Math.round((matched.length / jdSkills.length) * 100);
//     }

//     updateGauge(score, missing.length);

// });



analyzeBtn.addEventListener("click", function() {
    const JDText = document.getElementById("jobDesc").value;

    if (!JDText.trim()) {
        alert("Please paste Job Description first!");
        return;
    }

    const resumeSkills = extractedResumeSkills || [];

    const jdSkills = skillsList.filter(skill =>
        JDText.toLowerCase().includes(skill.toLowerCase())
    );

    const matched = resumeSkills.filter(skill => jdSkills.includes(skill));
    const missing = jdSkills.filter(skill => !resumeSkills.includes(skill));
    const extra = resumeSkills.filter(skill => !jdSkills.includes(skill));

    updateAISuggestions(jdSkills, resumeSkills, matched, missing, extra);

    let score = 0;
    if (jdSkills.length > 0) {
        score = Math.round((matched.length / jdSkills.length) * 100);
    }

    updateGauge(score, missing.length);
});




function updateGauge(score, issues) {
    const maxDash = 180;
    const filled = (score / 100) * maxDash;

    document.getElementById("gaugeFill").style.strokeDashoffset =
        maxDash - filled;

    document.getElementById("scoreValue").textContent = `${score}/100`;
    document.getElementById("scoreIssues").textContent = `${issues} Issues`;
}




function updateAISuggestions(jdSkills, resumeSkills, matched, missing, extra) {

    // Required Skills
    document.querySelector("#requiredSkills p").textContent =
        jdSkills.length ? jdSkills.join(", ") : "—";

    // Missing Skills
    document.querySelector("#missingSkills p").textContent =
        missing.length ? missing.join(", ") : "—";

    // Strengths (Matched)
    document.querySelector("#strengths p").textContent =
        matched.length ? matched.join(", ") : "—";

    // Improvement Suggestions
    let suggestions = "";

    if (missing.length > 0) {
        suggestions += `You should learn: ${missing.join(", ")}. `;
    }

    if (extra.length > 0) {
        suggestions += `Extra skills in resume: ${extra.join(", ")}. `;
    }                           

    if (!suggestions.trim()) {
        suggestions = "Your resume matches well!";
    }

    document.querySelector("#improvementSuggestions p").innerHTML = suggestions;
}
