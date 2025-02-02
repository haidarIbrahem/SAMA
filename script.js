let currentStep = 0;
const risks = []; // Array to store risks
let stages = []; // Array to store user-defined time stages
let defenseLayers = []; // Array to store user-defined defense layers
let currentStageIndex = 0; // To keep track of the current stage
let riskLocations = [];
let previousRisk = null;
let chains = {}; // Object to store chains of related risks
let currentChainId = 0; // To generate unique chain IDs
let selectedLocation = {
  stages: [],
  layers: [],
  goals: [],
};
let isSavingToSameLocation = false; // To track if saving to the same location
const goals = []; // Array to store goals

document.getElementById("createProjectBtn").onclick = function () {
  document.getElementById("createProjectForm").classList.remove("hidden");
};
// عند الضغط على زر Edit Project
document.getElementById("editProjectBtn").addEventListener("click", () => {
  // مطالبة المستخدم بإدخال كود المشروع
  const projectCode = prompt("Enter the Project Code to edit:");

  // التحقق من إدخال كود المشروع
  if (!projectCode) {
    alert("Project Code is required to edit a project.");
    return;
  }

  // جلب بيانات المشروع من الخادم باستخدام الكود
  fetch(`http://localhost:3000/projects/${projectCode}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Project not found.");
      }
      return response.json();
    })
    .then((project) => {
      // ملء الحقول ببيانات المشروع
      document.getElementById("projectCode").value = project.projectCode || "";
      document.getElementById("projectName").value = project.projectName || "";
      document.getElementById("projectDescription").value = project.projectDescription || "";

      // عرض النموذج لتعديل المشروع
      document.getElementById("createProjectForm").classList.remove("hidden");
    })
    .catch((error) => {
      console.error(error);
      alert("Error fetching project data. Please try again.");
    });
});
function updateProject() {
  const projectCode = document.getElementById("projectCode").value;
  const projectName = document.getElementById("projectName").value;
  const projectDescription = document.getElementById("projectDescription").value;

  fetch(`http://localhost:3000/projects/${projectCode}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, projectDescription }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update the project.");
      }
      return response.text();
    })
    .then((data) => {
      alert("Project updated successfully.");
    })
    .catch((error) => {
      console.error(error);
      alert("Error updating the project. Please try again.");
    });
}


// Close the modal when clicking the close button
document.getElementById("closeModal").onclick = function () {
  document.getElementById("projectModal").classList.add("hidden");
};

function nextStep() {
  const steps = document.querySelectorAll(".form-step");
  if (currentStep < steps.length - 1) {
    steps[currentStep].classList.add("hidden"); // إخفاء الخطوة الحالية
    currentStep++;
    steps[currentStep].classList.remove("hidden"); // عرض الخطوة التالية

    // حساب عوامل الخطر إذا كانت الخطوة الأخيرة
    if (currentStep === steps.length - 1) {
      calculateRiskFactors();
    }
  }
}

function prevStep() {
  const steps = document.querySelectorAll(".form-step");
  if (currentStep > 0) {
    steps[currentStep].classList.add("hidden"); // إخفاء الخطوة الحالية
    currentStep--;
    steps[currentStep].classList.remove("hidden"); // عرض الخطوة السابقة
  }
}

// Example of calculating risk factors (just a placeholder for your logic)
function calculateRiskFactors() {
  // Logic to calculate horizontal and vertical risk factors
  // You can integrate this with the SAMA model calculations
  console.log("Calculating risk factors...");
}
document.addEventListener("DOMContentLoaded", () => {
  // التحقق من وجود الحاويات
  const stagesContainer = document.getElementById("stagesContainer");
  const defenseLayerStep = document.getElementById("defenseLayerStep");
  const defenseLayersContainer = document.getElementById("defenseLayersContainer");
  const currentStageLabel = document.getElementById("currentStageLabel");
  const addLayerButton = document.getElementById("addLayerButton");
  const nextStageButton = document.getElementById("nextStageButton");

  if (!stagesContainer || !defenseLayerStep || !defenseLayersContainer || !currentStageLabel || !addLayerButton || !nextStageButton) {
    console.error("Missing required elements in the DOM.");
  } else {
    console.log("All elements are properly initialized.");
  }
});


// Generate time stages based on user input

// إنشاء الحقول للمراحل الزمنية
function generateStages() {
  const numStages = parseInt(document.getElementById("numStages").value);
  const stagesContainer = document.getElementById("stagesContainer");
  stagesContainer.innerHTML = "";

  if (numStages > 0) {
    stages = [];
    defenseLayers = {};
    currentStageIndex = 0;

    for (let i = 1; i <= numStages; i++) {
      const stageDiv = document.createElement("div");
      stageDiv.classList.add("stage");

      const stageLabel = document.createElement("label");
      stageLabel.innerText = `Stage ${i} Name:`;
      const stageInput = document.createElement("input");
      stageInput.type = "text";
      stageInput.placeholder = `Stage ${i}`;
      stageInput.required = true;

      // عند تغيير اسم المرحلة، أضفها إلى قائمة المراحل
      stageInput.addEventListener("input", (e) => {
        const stageName = e.target.value.trim();
        stages[i - 1] = stageName;
        if (!defenseLayers[stageName]) {
          defenseLayers[stageName] = [];
        }
      });

      stageDiv.appendChild(stageLabel);
      stageDiv.appendChild(stageInput);
      stagesContainer.appendChild(stageDiv);
    }

    // عرض الخطوة التالية
    document.getElementById("defenseLayerStep").classList.remove("hidden");
    updateCurrentStageLabel();
  } else {
    alert("Please enter a valid number of stages.");
  }
  
  document.getElementById("riskQuestion").classList.remove("hidden"); 
}

// تحديث عنوان المرحلة الحالية
function updateCurrentStageLabel() {
  if (stages[currentStageIndex]) {
    document.getElementById("currentStageLabel").innerText = `Add Defense Layers for ${stages[currentStageIndex]}`;
  }
}

// إضافة طبقة دفاعية للمرحلة الحالية
function addDefenseLayer() {
  const defenseLayerContainer = document.getElementById("defenseLayersContainer");
  const defenseLayerInput = document.createElement("input");
  defenseLayerInput.type = "text";
  defenseLayerInput.placeholder = `Enter Defense Layer for ${stages[currentStageIndex]}`;
  defenseLayerInput.required = true;

  defenseLayerContainer.appendChild(defenseLayerInput);

  // حدث عند تغيير القيمة
  defenseLayerInput.addEventListener("change", () => {
    const layerName = defenseLayerInput.value.trim();
    if (layerName) {
      if (!defenseLayers[currentStageIndex]) {
        defenseLayers[currentStageIndex] = [];
      }
      defenseLayers[currentStageIndex].push(layerName); // إضافة الطبقة إلى المرحلة الحالية
      console.log(`Added layer: ${layerName} to stage index: ${currentStageIndex}`);
    }
  });
}
function hidePreviousSteps() {
  document.getElementById("stagesContainer").classList.add("hidden");
  document.getElementById("defenseLayerStep").classList.add("hidden");
  const timeStagesElement = document.getElementById("timeStagesStep");
  if (timeStagesElement) {
      timeStagesElement.classList.add("hidden");
  } else {
      console.warn("Element with id 'timeStagesStep' not found.");
  }
  
}
// الانتقال إلى المرحلة التالية
function nextDefenseLayerStep() {
  // التحقق من أن المرحلة الحالية تحتوي على طبقات
  const currentStageLayers = defenseLayers[currentStageIndex] || [];
  if (currentStageLayers.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Data',
      text: 'Please add at least one defense layer for the current stage before proceeding!',
    });
    return; // إيقاف العملية إذا لم يتم إدخال طبقات
  }

  if (currentStageIndex < stages.length - 1) {
    currentStageIndex++; // الانتقال إلى المرحلة التالية
    updateCurrentStageLabel();
    document.getElementById("defenseLayersContainer").innerHTML = ""; // تنظيف الإدخالات
    console.log(`Moved to stage index: ${currentStageIndex}`);
  } else {
    Swal.fire({
      icon: 'success',
      title: 'All Stages Completed',
      text: 'You have successfully entered defense layers for all stages!',
    });hidePreviousSteps(); 
    document.getElementById("riskQuestion").classList.remove("hidden");
    console.log("Final Defense Layers:", defenseLayers); // عرض الطبقات النهائية
  }
 
    // أظهر السؤال حول إضافة المخاطر
}

// ربط زر إضافة الطبقات بوظيفته
document.getElementById("addLayerButton").addEventListener("click", addDefenseLayer);

// إنهاء المرحلة الحالية
function finishStage() {
  // الحصول على المدخلات للطبقات الحالية
  const currentDefenseLayers = Array.from(
    document
      .getElementById("defenseLayersContainer")
      .querySelectorAll('input[type="text"]')
  )
    .map((input) => input.value.trim())
    .filter((value) => value !== ""); // تجاهل القيم الفارغة

  if (currentDefenseLayers.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'No Layers Added',
      text: 'Please add at least one defense layer before proceeding!',
    });
    return; // إيقاف العملية إذا لم يتم إدخال طبقات
  }

  // تخزين طبقات الدفاع للمرحلة الحالية
  defenseLayers[currentStageIndex] = currentDefenseLayers;

  // التحقق مما إذا كانت جميع المراحل مكتملة
  if (currentStageIndex < stages.length - 1) {
    currentStageIndex++; // الانتقال إلى المرحلة التالية
    document.getElementById("defenseLayersContainer").innerHTML = ""; // تنظيف المدخلات للمرحلة التالية
    nextDefenseLayerStep(); // متابعة العملية
  } else {
    Swal.fire({
      icon: 'success',
      title: 'All Stages Completed',
      text: 'You have successfully finished adding layers for all stages!',
    });
    askAddRisks(); // سؤال المستخدم إذا كان يريد إضافة مخاطر
  }
}


function askAddRisks() {
  const addRisksStep = document.getElementById("riskQuestion");
  addRisksStep.classList.remove("hidden"); // Show the question about adding risks
}
document.getElementById("yesAddRisksBtn").onclick = function () {
  document.getElementById("riskQuestion").classList.add("hidden"); // Hide the question
  document.getElementById("step9").classList.remove("hidden"); // Show the add risks step
};

document.getElementById("noSkipRisksBtn").onclick = function () {
  // Skip to the next relevant step, or finish the project
  alert("You chose to skip adding risks.");
  finishProject(); // Or navigate to the next step if you have one
};
window.onload = function () {
  const calculateRFHButton = document.getElementById("calculateRFHButton");
  calculateRFHButton.disabled = true; // تعطيل الزر في البداية
};
function addRisk() {
  const riskCode = document.getElementById("riskCode").value.trim();
  const riskName = document.getElementById("riskName").value.trim();
  const focusOfImpact = parseFloat(document.getElementById("focusOfImpact").value);
  const suddenness = parseFloat(document.getElementById("suddenness").value);
  const frequency = parseFloat(document.getElementById("frequency").value);
  const effectiveness = parseFloat(document.getElementById("effectiveness").value);

  if (!riskCode || !riskName || isNaN(focusOfImpact) || isNaN(suddenness) || isNaN(frequency) || isNaN(effectiveness)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Input",
      text: "Please fill in all fields with valid data.",
    });
    return;
  }

  const rfh = focusOfImpact * suddenness * frequency * effectiveness;

  if (!selectedLocation.layers || selectedLocation.layers.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Invalid Layers",
      text: "Please select at least one layer.",
    });
    return;
  }

  showRelationModal(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, rfh);
}

function showRelationModal(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, rfh) {
  if (!selectedLocation || !selectedLocation.layers) {
      console.warn("Selected location or layers are undefined.");
      Swal.fire("Error", "Please select a valid location and layers before proceeding!", "error");
      return;
  }

  // العثور على جميع المخاطر في نفس الطبقات وليس فقط الخطر الأول
  const relatedRisksInSameLayer = risks.filter(risk => 
      risk.location && risk.location.layers && Array.isArray(risk.location.layers) && 
      risk.location.layers.some(layer => selectedLocation.layers.includes(layer))
  );

  if (relatedRisksInSameLayer.length === 0) {
      addRiskToDatabase(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, rfh);
      return;
  }

  const riskOptions = relatedRisksInSameLayer.reduce((options, risk) => {
      options[risk.riskCode] = `${risk.riskName} (RFH: ${risk.rfh.toFixed(2)})`;
      return options;
  }, {});

  Swal.fire({
      title: "Select Relationship with Existing Risks",
      html: `
          <select id="relatedRisk" class="swal2-select">
              <option value="">No Relationship (Start a New Chain)</option>
              ${Object.entries(riskOptions)
                  .map(([code, label]) => `<option value="${code}">${label}</option>`)
                  .join("")}
          </select>
          <select id="relationType" class="swal2-select">
              <option value="cumulative">Cumulative</option>
              <option value="maximum">Maximum Value</option>
          </select>
      `,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
          const relatedRisk = document.getElementById("relatedRisk").value;
          const relationType = document.getElementById("relationType").value;
          return { relatedRisk, relationType };
      }
  }).then((result) => {
      if (result.isConfirmed) {
          const { relatedRisk, relationType } = result.value;
          let chainId;
          
          if (!relatedRisk) {
              chainId = ++currentChainId;
              addRiskToDatabase(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, rfh, chainId);
          } else {
              const relatedRiskObj = risks.find(risk => risk.riskCode === relatedRisk);
              if (!relatedRiskObj) {
                  console.warn("Related risk not found.");
                  return;
              }
              chainId = relatedRiskObj.chainId;
              
              // حساب RFH بناءً على نوع العلاقة
              if (relationType === "cumulative") {
                  rfh += relatedRiskObj.rfh;
              } else if (relationType === "maximum") {
                  rfh = Math.max(rfh, relatedRiskObj.rfh);
              }
              
              addRiskToChain(chainId, riskCode, riskName, rfh, relationType, relatedRisk);
          }
      }
  });
}

function addRiskToDatabase(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, rfh) {
  const isFirstRisk = risks.length === 0;

  selectedLocation.layers.forEach(layer => {
    const newRisk = {
      riskCode,
      riskName,
      focusOfImpact,
      suddenness,
      frequency,
      effectiveness,
      rfh,
      chainId: ++currentChainId,
      location: { ...selectedLocation },
      relatedRiskCode: null,
      timeStage: selectedLocation.stages.join(", "),
      layer: layer,
    };

    if (!isFirstRisk) {
      if (layer === selectedLocation.layers[0]) {
        const relatedRisk = risks.find(risk => risk.layer === layer);
        if (relatedRisk) {
          newRisk.relatedRiskCode = relatedRisk.riskCode;
        }
      }
    }

    risks.push(newRisk);

    if (!chains[newRisk.chainId]) {
      chains[newRisk.chainId] = [];
    }
    chains[newRisk.chainId].push(newRisk);

    Swal.fire({
      title: "Risk Added Successfully",
      text: `Risk Name: ${riskName}\nRFH: ${rfh.toFixed(2)}\nLocation: ${JSON.stringify(selectedLocation)}\nLayer: ${layer}`,
      icon: "success",
      confirmButtonText: "OK"
    }).then(() => {
        document.getElementById("addRiskButton").disabled = false;
      resetFormFields(); // تنظيف الحقول بعد إغلاق SweetAlert
    });
  });
  document.getElementById("addRiskButton").disabled = false;
  calculateRFH();
}

function resetFormFields() {
  document.getElementById("riskCode").value = "";
  document.getElementById("riskName").value = "";
  document.getElementById("focusOfImpact").value = "";
  document.getElementById("suddenness").value = "";
  document.getElementById("frequency").value = "";
  document.getElementById("effectiveness").value = "";
  document.getElementById("rfh").value = "";

  // تمكين الزر بعد إعادة تعيين الحقول
  document.getElementById("addRiskButton").disabled = false;
}

function addRiskToChain(chainId, riskCode, riskName, rfh, relationType, relatedRiskCode) {
  if (!chains[chainId]) {
    chains[chainId] = [];
  }

  selectedLocation.layers.forEach(layer => {
    const relatedRisk = risks.find(risk => risk.layer === layer && risk.riskCode === relatedRiskCode);
    const isRelatedLayer = !!relatedRisk;

    const newRisk = {
      riskCode,
      riskName,
      rfh,
      relation: isRelatedLayer ? relationType : null,
      relatedRiskCode: isRelatedLayer ? relatedRiskCode : null,
      chainId: isRelatedLayer ? chainId : ++currentChainId,
      timeStage: selectedLocation.stages.join(", "),
      layer: layer,
    };

    risks.push(newRisk);

    if (!chains[newRisk.chainId]) {
      chains[newRisk.chainId] = [];
    }
    chains[newRisk.chainId].push(newRisk);

    Swal.fire({
      title: "Risk Added Successfully",
      text: `Risk Name: ${riskName}\nRFH: ${rfh.toFixed(2)}\nChain ID: ${newRisk.chainId}\nTime Stage: ${selectedLocation.stages.join(", ")}\nLayer: ${layer}`,
      icon: "success",
      confirmButtonText: "OK"
    }).then(() => {
      resetFormFields(); // تنظيف الحقول بعد إغلاق SweetAlert
    });
  });

  document.getElementById("addRiskButton").disabled = false;
  calculateRFH();
}

function updateChainId(riskCode, relatedRiskCode) {
  if (!chains[riskCode]) {
    chains[riskCode] = { chainId: ++currentChainId, relatedRisks: [] };
  }
  if (relatedRiskCode) {
    chains[riskCode].relatedRisks.push(relatedRiskCode);
  }
}

  // متغير لتخزين المخاطر التي ليس لها علاقة
// متغير لتخزين المخاطر التي ليس لها علاقة
const noRelationRisks = [];
let maxRFH = 0; // تعيين القيمة الابتدائية للماكسيمم إلى 0
function calculateRFHWithRelation(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, rfh, relation) {
  const existingRisks = risks.filter(risk =>
    risk.location.stages.some(stage => selectedLocation.stages.includes(stage)) &&
    risk.location.layers.some(layer => selectedLocation.layers.includes(layer))
  );

  let newRFH = rfh;
  let message = "";

  if (existingRisks.length > 0) {
    switch (relation) {
      case 'maximum':
        const sameLayerRisks = existingRisks.filter(risk =>
          risk.location.layers.some(layer => selectedLocation.layers.includes(layer))
        );

        const maxRFH = Math.max(...sameLayerRisks.map(risk => risk.rfh), rfh);
        newRFH = maxRFH;
        message = `The maximum RFH value in the same layer is: ${newRFH.toFixed(2)}.`;
        break;

      case 'cumulative':
        const totalRFH = existingRisks.reduce((sum, risk) => sum + risk.rfh, rfh);
        newRFH = totalRFH;
        message = `Cumulative RFH value: ${newRFH.toFixed(2)}.`;
        break;

      case 'no_relation':
        newRFH = rfh;
        message = `No relation: The RFH value for the new risk (${riskName}) is added independently as: ${newRFH.toFixed(2)}.`;
        break;
    }
  } else {
    newRFH = rfh;
    message = `The risk is added with RFH: ${newRFH.toFixed(2)}.`;
  }

  addRiskToDatabase(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, newRFH);

  Swal.fire({
    title: "Risk Added Successfully",
    text: `Risk Name: ${riskName}\nRFH: ${newRFH.toFixed(2)}\n\n${message}`,
    icon: "success",
    confirmButtonText: "OK"
  });

  Swal.close();
}
function displayNoRelationRisks() {
  if (noRelationRisks.length === 0) {
    console.log("No risks with no_relation to display.");
    return;
  }

  console.log("Risks with no_relation:");
  noRelationRisks.forEach(risk => {
    console.log(`Risk Code: ${risk.riskCode}, Risk Name: ${risk.riskName}, RFH: ${risk.rfh.toFixed(2)}, Layer: ${risk.layer}`);
  });

  addRiskToDatabase(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, newRFH);
  calculateRFH();

  Swal.fire({
    title: "Risk Added Successfully",
    text: `Risk Name: ${riskName}\nRFH: ${newRFH.toFixed(2)}\n\n${message}`,
    icon: "success",
    confirmButtonText: "OK"
  });

  Swal.close();
}

// وظيفة لإضافة الخطر (مثال)
function submitRisk() {
    const riskName = document.getElementById("riskName").value;
    const riskLocation = {
        stages: selectedLocation.stages,
        layers: selectedLocation.layers,
    };

    const newRisk = {
        riskName: riskName,
        location: riskLocation,
        rfh: 0 // مثال على إضافة قيمة RFH للخطر
    };

    // إضافة الخطر
    addRisk(newRisk);
    Swal.fire({
        icon: "success",
        title: "Risk Added",
        text: `Risk ${riskName} added successfully.`
    });
}

function openRiskLocationModal(isSameLocation = false) {
  const modal = document.getElementById("riskLocationModal");
  const modalRiskStagesContainer = document.getElementById("modalRiskStagesContainer");

  modalRiskStagesContainer.innerHTML = "";

  const errorMessage = document.createElement("div");
  errorMessage.id = "errorMessage";
  errorMessage.style.color = "red";
  errorMessage.style.display = "none";
  modalRiskStagesContainer.appendChild(errorMessage);

  if (stages.length > 0) {
    const stagesTitle = document.createElement("h3");
    stagesTitle.textContent = "Time Stages:";
    modalRiskStagesContainer.appendChild(stagesTitle);

    stages.forEach((stage, index) => {
      const checkboxWrapper = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `stage-${index}`;
      checkbox.value = stage;
      checkbox.name = "timeStages";

      const label = document.createElement("label");
      label.htmlFor = `stage-${index}`;
      label.textContent = stage;

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(label);
      modalRiskStagesContainer.appendChild(checkboxWrapper);
    });
  }

  if (Object.keys(defenseLayers).length > 0) {
    const layersTitle = document.createElement("h3");
    layersTitle.textContent = "Defense Layers:";
    modalRiskStagesContainer.appendChild(layersTitle);

    Object.keys(defenseLayers).forEach((stage) => {
      const layerList = defenseLayers[stage];
      if (layerList.length > 0) {
        const stageTitle = document.createElement("h4");
        stageTitle.textContent = `Layers for ${stages[stage]}:`;
        modalRiskStagesContainer.appendChild(stageTitle);

        layerList.forEach((layer, index) => {
          const checkboxWrapper = document.createElement("div");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = `layer-${stage}-${index}`;
          checkbox.value = layer;
          checkbox.name = "defenseLayers";

          checkbox.addEventListener("change", function () {
            const stageCheckbox = document.getElementById(`stage-${stage}`);
            if (this.checked && !stageCheckbox.checked) {
              errorMessage.textContent = "Please select the layer corresponding to the correct time stage.ً";
              errorMessage.style.display = "block";
              this.checked = false;
            } else {
              errorMessage.style.display = "none";
            }
          });

          const label = document.createElement("label");
          label.htmlFor = `layer-${stage}-${index}`;
          label.textContent = layer;

          checkboxWrapper.appendChild(checkbox);
          checkboxWrapper.appendChild(label);
          modalRiskStagesContainer.appendChild(checkboxWrapper);
        });
      }
    });
  }

  if (goals.length > 0) {
    const goalsTitle = document.createElement("h3");
    goalsTitle.textContent = "Goals:";
    modalRiskStagesContainer.appendChild(goalsTitle);

    goals.forEach((goal, index) => {
      const checkboxWrapper = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `goal-${index}`;
      checkbox.value = goal;
      checkbox.name = "goals";

      const label = document.createElement("label");
      label.htmlFor = `goal-${index}`;
      label.textContent = goal;

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(label);
      modalRiskStagesContainer.appendChild(checkboxWrapper);
    });
  }

  const sameLocationCheckboxWrapper = document.createElement("div");
  const sameLocationCheckbox = document.createElement("input");
  sameLocationCheckbox.type = "checkbox";
  sameLocationCheckbox.id = "sameLocationCheckbox";
  sameLocationCheckbox.checked = isSameLocation;

  const sameLocationLabel = document.createElement("label");
  sameLocationLabel.htmlFor = "sameLocationCheckbox";
  sameLocationLabel.textContent = "Save in the same location";

  sameLocationCheckboxWrapper.appendChild(sameLocationCheckbox);
  sameLocationCheckboxWrapper.appendChild(sameLocationLabel);
  modalRiskStagesContainer.appendChild(sameLocationCheckboxWrapper);

  sameLocationCheckbox.addEventListener("change", function () {
    isSavingToSameLocation = this.checked;
  });

  modal.classList.remove("hidden");
}
document.getElementById("saveRiskLocation").addEventListener("click", () => {
  const selectedStages = Array.from(
    document.querySelectorAll('input[name="timeStages"]:checked')
  ).map((checkbox) => checkbox.value);

  const selectedLayers = Array.from(
    document.querySelectorAll('input[name="defenseLayers"]:checked')
  ).map((checkbox) => checkbox.value);

  const selectedGoals = Array.from(
    document.querySelectorAll('input[name="goals"]:checked')
  ).map((checkbox) => checkbox.value);

  if (isSavingToSameLocation) {
    selectedLocation.stages.push(...selectedStages);
    selectedLocation.layers.push(...selectedLayers);
    selectedLocation.goals.push(...selectedGoals);
  } else {
    selectedLocation = {
      stages: selectedStages,
      layers: selectedLayers,
      goals: selectedGoals,
    };
  }

  Swal.fire({
    icon: "success",
    title: "Location Saved",
    text: `Selected Location:\nStages: ${selectedStages.join(", ")}\nLayers: ${selectedLayers.join(", ")}\nGoals: ${selectedGoals.join(", ")}`,
  });

  document.getElementById("riskLocationModal").classList.add("hidden");
});

document.getElementById("relationshipWithRisks").addEventListener("change", function() {
  const relationship = this.value;

  document.getElementById("confirmRiskRelationship").style.display = "inline-block";
});

document.getElementById("confirmRiskRelationship").addEventListener("click", function() {
  const relationship = document.getElementById("relationshipWithRisks").value;
});
function populateRiskLocationOptions() {
  const stagesContainer = document.getElementById("riskStagesContainer");

  if (!stagesContainer) {
      console.warn("Element with id 'riskStagesContainer' not found.");
      return; // منع تنفيذ باقي الدالة إذا لم يكن العنصر موجودًا
  }

  stagesContainer.innerHTML = ""; // تعيين قيمة فارغة قبل التعديل

  stages.forEach((stage, index) => {
      const stageDiv = document.createElement("div");
      const stageTitle = document.createElement("h4");
      stageTitle.innerText = stage;
      stageDiv.appendChild(stageTitle);

      defenseLayers[index]?.forEach((layer) => {
          const layerLabel = document.createElement("label");
          layerLabel.innerHTML = `
              <input type="checkbox" name="riskLayer" value="${stage}|${layer}">
              ${layer}
          `;
          stageDiv.appendChild(layerLabel);
      });

      stagesContainer.appendChild(stageDiv);
  });
}


// تأكد من استدعاء الدالة عند ظهور نموذج إضافة المخاطر
document.getElementById("yesAddRisksBtn").onclick = function () {
  document.getElementById("riskQuestion").classList.add("hidden"); // إخفاء سؤال إضافة المخاطر
  document.getElementById("step9").classList.remove("hidden"); // إظهار خطوة إضافة المخاطر
  populateRiskLocationOptions(); // ملء خيارات موقع الخطر
};
// Collect Risk Data
function collectRiskData() {
  const riskName = document.getElementById("riskName").value;
  const focusOfImpact = parseFloat(document.getElementById("focusOfImpact").value);
  const suddenness = parseFloat(document.getElementById("suddenness").value);
  const frequency = parseFloat(document.getElementById("frequency").value);
  const effectiveness = parseFloat(document.getElementById("effectiveness").value);

  const affectedStages = [];
  document.querySelectorAll('input[name="affectedStages"]:checked').forEach((checkbox) => {
    affectedStages.push(checkbox.value);
  });

  if (
    !riskName ||
    isNaN(focusOfImpact) ||
    isNaN(suddenness) ||
    isNaN(frequency) ||
    isNaN(effectiveness) ||
    affectedStages.length === 0
  ) {
    alert("Please fill in all fields and select at least one affected stage.");
    return;
  }

  risks.push({
    riskName,
    focusOfImpact,
    suddenness,
    frequency,
    effectiveness,
    affectedStages,
  });

  alert("Risk added successfully!");
  console.log("Current Risks:", risks);
  calculateRFH();
  calculateRFV();
}

// Add an initial goal input field on page load
window.onload = function () {
  addGoal(); // Add the first goal field automatically
};
function addGoal() {
  const goalsContainer = document.getElementById("goalsContainer");
  const goalInput = document.createElement("input");
  goalInput.type = "text";
  goalInput.placeholder = "Enter Goal";
  goalInput.required = true;
  goalInput.classList.add("goal-input");

  goalsContainer.appendChild(goalInput);

  goalInput.addEventListener("blur", () => {
    const value = goalInput.value.trim();
    if (value && !goals.includes(value)) {
      goals.push(value);
      console.log("Goal added:", value);
    } else if (goals.includes(value)) {
      alert("This goal is already added.");
    }
  });
}

document.getElementById("goalSubmit").onclick = function () {
  const goals = document.querySelectorAll(".goal-input");
  if (Array.from(goals).some((input) => input.value.trim() === "")) {
    alert("Please ensure all goals are filled.");
    return;
  }
  document.getElementById("step4").classList.add("hidden");
  document.getElementById("timeStagesStep").classList.remove("hidden");
  nextStep();
};

function finishProject() {
  alert("Project has been completed successfully!");
}

function checkRiskCount() {
  // إنشاء خريطة لتجميع المخاطر حسب الموقع
  const locationMap = risks.reduce((map, risk) => {
      if (!map[risk.riskLocation]) {
          map[risk.riskLocation] = 0;
      }
      map[risk.riskLocation]++;
      return map;
  }, {});

  // التحقق إذا كان هناك موقع يحتوي على خطرين أو أكثر
  const hasMultipleRisksInSameLocation = Object.values(locationMap).some((count) => count >= 2);

  // إظهار أو إخفاء قسم العلاقات بناءً على النتيجة
  if (hasMultipleRisksInSameLocation) {
      document.getElementById('riskRelationsContainer').style.display = 'block';
  } else {
      document.getElementById('riskRelationsContainer').style.display = 'none';
  }
}

function submitProject() {
  const projectCode = document.getElementById("projectCode").value;
  const projectName = document.getElementById("projectName").value;
  const projectDescription =
    document.getElementById("projectDescription").value;

  fetch("http://localhost:3000/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectCode, projectName, projectDescription }),
  })
    .then((response) => response.text())
    .then((data) => alert(data))
    .catch((err) => console.error(err));
}
 
function submitRisk() {
  const riskName = document.getElementById("riskName").value;
  const focusOfImpact = parseFloat(document.getElementById("focusOfImpact").value);
  const suddenness = parseFloat(document.getElementById("suddenness").value);
  const frequency = parseFloat(document.getElementById("frequency").value);
  const effectiveness = parseFloat(document.getElementById("effectiveness").value);

  fetch("http://localhost:3000/risks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      riskName,
      focusOfImpact,
      suddenness,
      frequency,
      effectiveness,
    }),
  })
    .then((response) => response.text())
    .then((data) => alert(data))
    .catch((err) => console.error(err));
}
function getRisksInLocation() {
  const risks = document.querySelectorAll('#risksList li');
  return risks;
}

// Example of how to initialize events for dynamic elements if needed
document.getElementById("addDefenseLayerBtn").onclick = addDefenseLayer;
document.getElementById("addGoalBtn").onclick = addGoal;

// Calculate RFH
function calculateRFH() {
  const results = {};

  for (const [chainId, chainRisks] of Object.entries(chains)) {
    let chainRFH = 0;
    let maxRFH = 0;
    let horizontalPaths = [];

    chainRisks.forEach((risk, index) => {
      if (index === 0) {
        chainRFH = risk.rfh;
        maxRFH = risk.rfh;
        horizontalPaths.push(`RF${risk.riskCode}`);
      } else {
        const previousRisk = chainRisks[index - 1];
        if (risk.relation === 'cumulative') {
          chainRFH += risk.rfh;
          horizontalPaths.push(`+ RF${risk.riskCode}`);
        } else if (risk.relation === 'maximum') {
          maxRFH = Math.max(maxRFH, risk.rfh);
          horizontalPaths = [`max(${horizontalPaths.join(", ")}, RF${risk.riskCode})`];
        }
      }
    });

    let finalValue = maxRFH;
    if (chainRisks.some(risk => risk.relation === 'cumulative')) {
      finalValue = maxRFH + chainRFH;
    }

    results[chainId] = {
      chainRFH,
      maxRFH,
      finalValue,
      risks: chainRisks,
      horizontalPaths: horizontalPaths.join(" "),
    };
  }

  displayRFHResults(results);
}

// Display RFH results
function displayRFHResults(results) {
  let output = "<h3>RFH Calculation Results</h3>";

  const resultsByLayer = {};

  for (const [chainId, data] of Object.entries(results)) {
    const firstRisk = data.risks[0];
    const layer = firstRisk.layer || "Unknown Layer";

    if (!resultsByLayer[layer]) {
      resultsByLayer[layer] = [];
    }
    resultsByLayer[layer].push(data);
  }

  for (const [layer, layerResults] of Object.entries(resultsByLayer)) {
    output += `<h4>Layer: ${layer}</h4>`;
    output += "<table border='1' style='width:100%; text-align:left;'>";
    output += "<tr><th>Time Stage</th><th>Coding</th><th>Horizontal Paths</th><th>Value</th></tr>";

    layerResults.forEach((data) => {
      const firstRisk = data.risks[0];
      const timeStage = firstRisk.timeStage || "Unknown Stage";
      const coding = `R${data.risks[0].chainId}F<sub>h${layer.toLowerCase()}</sub>`;
      const horizontalPaths = data.horizontalPaths;
      const finalValue = data.finalValue;

      output += `<tr>
                  <td>${timeStage}</td>
                  <td>${coding}</td>
                  <td>${horizontalPaths}</td>
                  <td>${finalValue.toFixed(2)}</td>
                </tr>`;
    });

    output += "</table>";
  }

  Swal.fire({
    title: "RFH Calculation Results",
    html: output,
    icon: "info",
    width: "80%",
  });
}

// Event listener for adding a risk
document.getElementById("addRiskButton").addEventListener("click", () => {
  const riskCode = document.getElementById("riskCode").value.trim();
  const riskName = document.getElementById("riskName").value.trim();
  const focusOfImpact = parseFloat(document.getElementById("focusOfImpact").value);
  const suddenness = parseFloat(document.getElementById("suddenness").value);
  const frequency = parseFloat(document.getElementById("frequency").value);
  const effectiveness = parseFloat(document.getElementById("effectiveness").value);

  if (!riskCode || !riskName || isNaN(focusOfImpact) || isNaN(suddenness) || isNaN(frequency) || isNaN(effectiveness)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Input",
      text: "Please fill in all fields with valid data.",
    });
    return;
  }

  const rfh = focusOfImpact * suddenness * frequency * effectiveness;

  // Show the relation modal
  showRelationModal(riskCode, riskName, focusOfImpact, suddenness, frequency, effectiveness, rfh);
});

// Event listener for calculating RFH
document.getElementById("calculateRFHButton").addEventListener("click", calculateRFH);


// ربط الزر بوظيفة الحساب
document.getElementById("horizontalAnalysisButton").addEventListener("click", calculateRFH);




// ربط الزر بوظيفة الحساب
document.getElementById("horizontalAnalysisButton").addEventListener("click", calculateRFH);
function calculateRFV() {
  console.log("Starting RFV Calculation...");

  // التحقق من أن مصفوفة المخاطر موجودة وليست فارغة
  if (!risks || risks.length === 0) {
      console.warn("No risks available for RFV calculation.");
      return;
  }

  risks.forEach((risk, index) => {
      // التحقق من أن الكائن غير فارغ ويحتوي على بيانات الموقع
      if (!risk || !risk.location) {
          console.warn(`Risk at index ${index} is missing location data.`);
          return;
      }

      // التحقق من أن الموقع يحتوي على أهداف وأنها مصفوفة صالحة
      if (!risk.location.goals || !Array.isArray(risk.location.goals)) {
          console.warn(`Risk at index ${index} has no valid goals.`);
          return;
      }

      // معالجة الأهداف لكل خطر
      risk.location.goals.forEach(goal => {
          console.log(`Processing goal: ${goal}`);
      });
  });



  console.log("RFV Calculation Completed.");

  displayRFVResults(goalResults);
}
function displayRFVResults(goalResults) {
  let results = "<h3>RFV Calculation Results</h3>";
  results += "<table border='1' style='width:100%; text-align:left;'>";
  results += "<tr><th>Goal</th><th>Total RFV</th></tr>";

  for (const [goalName, data] of Object.entries(goalResults)) {
    results += `<tr>
                  <td>${goalName || "No Goal Name"}</td>
                  <td>${data.totalRFV.toFixed(2)}</td>
                </tr>`;
  }

  results += "</table>";

  Swal.fire({
    title: "RFV Calculation Results",
    html: results,
    icon: "info",
    width: "80%",
  });
}
  
document.getElementById("analyzeVerticalButton").addEventListener("click", calculateRFV);
document.getElementById("calculateRFHButton").addEventListener("click", calculateRFH);

document.getElementById("horizontalAnalysisButton").addEventListener("click", calculateRFH);

document.getElementById("addDefenseLayerBtn").onclick = addDefenseLayer;

document.getElementById("addGoalBtn").onclick = addGoal;

// ربط الزر بحساب RFH
const calculateRFHButton = document.getElementById("calculateRFHButton");
if (calculateRFHButton) {
  calculateRFHButton.addEventListener("click", calculateRFH);
}

function calculateRiskFactors() {
  console.log("Calculating risk factors...");
}



// Event listeners
document.getElementById("addRiskButton").addEventListener("click", addRisk);
document.getElementById("calculateRFHButton").addEventListener("click", calculateRFH);
document.getElementById("analyzeVerticalButton").addEventListener("click", calculateRFV);
document.getElementById("addDefenseLayerBtn").onclick = addDefenseLayer;
document.getElementById("addGoalBtn").onclick = addGoal;
document.getElementById("horizontalAnalysisButton").addEventListener("click", calculateRFH);


