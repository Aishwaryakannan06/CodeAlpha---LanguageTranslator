
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const translateButton = document.getElementById("translateButton");
const swapButton = document.getElementById("swapButton");
const copyButton = document.getElementById("copyButton");
const statusMessage = document.getElementById("statusMessage");
const characterCount = document.getElementById("characterCount");

// Update character count
inputText.addEventListener("input", () => {
    characterCount.textContent = `${inputText.value.length} / 1000`;
});

// Translate text using the Python backend
translateButton.addEventListener("click", async () => {
    const text = inputText.value.trim();

    if (!text) {
        statusMessage.textContent = "Please enter some text first.";
        return;
    }

    if (text.length > 1000) {
        statusMessage.textContent = "Please enter no more than 1000 characters.";
        return;
    }

    if (sourceLanguage.value === targetLanguage.value) {
        statusMessage.textContent = "Choose two different languages.";
        return;
    }

    translateButton.disabled = true;
    translateButton.textContent = "Translating...";
    statusMessage.textContent = "Please wait...";

    try {
        const response = await fetch("/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                source: sourceLanguage.value,
                target: targetLanguage.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Translation failed.");
        }

        outputText.value = data.translation;
        statusMessage.textContent = "Translation completed!";

    } catch (error) {
        statusMessage.textContent =
            error.message || "Unable to connect to the translation server.";
    } finally {
        translateButton.disabled = false;
        translateButton.textContent = "Translate Now";
    }
});

// Swap languages and text
swapButton.addEventListener("click", () => {
    if (sourceLanguage.value === "auto") {
        statusMessage.textContent =
            "Select a specific source language before swapping.";
        return;
    }

    const oldSource = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = oldSource;

    inputText.value = outputText.value;
    outputText.value = "";

    characterCount.textContent = `${inputText.value.length} / 1000`;
});

// Copy translated text
copyButton.addEventListener("click", async () => {
    if (!outputText.value) {
        statusMessage.textContent = "There is no translation to copy.";
        return;
    }

    try {
        await navigator.clipboard.writeText(outputText.value);
        statusMessage.textContent = "Translation copied!";
    } catch {
        statusMessage.textContent = "Unable to copy the translation.";
    }
});
