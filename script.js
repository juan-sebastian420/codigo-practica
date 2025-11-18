const bpmnXML = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" xmlns:ns1="modeler" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:ns0="xmlns" id="bpmn_copilot_Definition_id" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Web Modeler" exporterVersion="9d4d45f" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.8.0" ns0:modeler="http://camunda.org/schema/modeler/1.0" ns1:executionPlatform="Camunda Cloud" ns1:executionPlatformVersion="8.6">
  <bpmn:process id="Process_CICD_GitHub" name="Pipeline de CI/CD para Sitio Web" processType="None" isClosed="false" isExecutable="true">
    <bpmn:startEvent id="StartEvent_PushGitHub" name="Push a GitHub" zeebe:modelerTemplate="io.camunda.connectors.webhook.GithubWebhookConnector.v1" zeebe:modelerTemplateVersion="4">
      <bpmn:outgoing>Flow_To_Build</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_To_Build" sourceRef="StartEvent_PushGitHub" targetRef="Task_BuildWebsite" />
    <bpmn:serviceTask id="Task_BuildWebsite" name="Construir Sitio Web" implementation="##WebService">
      <bpmn:incoming>Flow_To_Build</bpmn:incoming>
      <bpmn:outgoing>Flow_To_Test</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_To_Test" sourceRef="Task_BuildWebsite" targetRef="Task_RunTests" />
    <bpmn:serviceTask id="Task_RunTests" name="Ejecutar Pruebas" implementation="##WebService">
      <bpmn:incoming>Flow_To_Test</bpmn:incoming>
      <bpmn:outgoing>Flow_To_Gateway</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_To_Gateway" sourceRef="Task_RunTests" targetRef="Gateway_TestsPassed" />
    <bpmn:exclusiveGateway id="Gateway_TestsPassed" name="¿Pruebas superadas?" default="Flow_To_NotifyFailure">
      <bpmn:incoming>Flow_To_Gateway</bpmn:incoming>
      <bpmn:outgoing>Flow_To_Deploy</bpmn:outgoing>
      <bpmn:outgoing>Flow_To_NotifyFailure</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_To_Deploy" name="Sí" sourceRef="Gateway_TestsPassed" targetRef="Task_DeployToProd">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=testsPassed = true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:serviceTask id="Task_DeployToProd" name="Desplegar a Producción" implementation="##WebService">
      <bpmn:incoming>Flow_To_Deploy</bpmn:incoming>
      <bpmn:outgoing>Flow_To_NotifySuccess</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_To_NotifySuccess" sourceRef="Task_DeployToProd" targetRef="Task_NotifySuccess" />
    <bpmn:serviceTask id="Task_NotifySuccess" name="Notificar Éxito en Slack" zeebe:modelerTemplate="io.camunda.connectors.Slack.v1" zeebe:modelerTemplateVersion="7" implementation="##WebService">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="io.camunda:slack:1" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_To_NotifySuccess</bpmn:incoming>
      <bpmn:outgoing>Flow_To_EndSuccess</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_To_EndSuccess" sourceRef="Task_NotifySuccess" targetRef="EndEvent_Success" />
    <bpmn:endEvent id="EndEvent_Success" name="Despliegue Exitoso">
      <bpmn:incoming>Flow_To_EndSuccess</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_To_NotifyFailure" name="No" sourceRef="Gateway_TestsPassed" targetRef="Task_NotifyFailure" />
    <bpmn:serviceTask id="Task_NotifyFailure" name="Notificar Fallo en Slack" zeebe:modelerTemplate="io.camunda.connectors.Slack.v1" zeebe:modelerTemplateVersion="7" implementation="##WebService">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="io.camunda:slack:1" />
        <zeebe:ioMapping>
          <zeebe:input target="token" />
        </zeebe:ioMapping>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_To_NotifyFailure</bpmn:incoming>
      <bpmn:outgoing>Flow_To_EndFailure</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_To_EndFailure" sourceRef="Task_NotifyFailure" targetRef="EndEvent_Failure" />
    <bpmn:endEvent id="EndEvent_Failure" name="Despliegue Fallido">
      <bpmn:incoming>Flow_To_EndFailure</bpmn:incoming>
    </bpmn:endEvent>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Process_CICD_GitHub">
    <bpmndi:BPMNPlane id="BPMNPlane_Process_CICD_GitHub" bpmnElement="Process_CICD_GitHub">
      <bpmndi:BPMNShape id="StartEvent_PushGitHub_di" bpmnElement="StartEvent_PushGitHub">
        <dc:Bounds x="57" y="52" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_BuildWebsite_di" bpmnElement="Task_BuildWebsite">
        <dc:Bounds x="175" y="30" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RunTests_di" bpmnElement="Task_RunTests">
        <dc:Bounds x="325" y="30" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_TestsPassed_di" bpmnElement="Gateway_TestsPassed" isMarkerVisible="true">
        <dc:Bounds x="500" y="45" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_DeployToProd_di" bpmnElement="Task_DeployToProd">
        <dc:Bounds x="625" y="30" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_NotifySuccess_di" bpmnElement="Task_NotifySuccess">
        <dc:Bounds x="775" y="30" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Success_di" bpmnElement="EndEvent_Success">
        <dc:Bounds x="957" y="52" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_NotifyFailure_di" bpmnElement="Task_NotifyFailure">
        <dc:Bounds x="625" y="170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Failure_di" bpmnElement="EndEvent_Failure">
        <dc:Bounds x="807" y="192" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_To_Build_di" bpmnElement="Flow_To_Build">
        <di:waypoint x="93" y="70" />
        <di:waypoint x="175" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_To_Test_di" bpmnElement="Flow_To_Test">
        <di:waypoint x="275" y="70" />
        <di:waypoint x="325" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_To_Gateway_di" bpmnElement="Flow_To_Gateway">
        <di:waypoint x="425" y="70" />
        <di:waypoint x="500" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_To_Deploy_di" bpmnElement="Flow_To_Deploy">
        <di:waypoint x="550" y="70" />
        <di:waypoint x="625" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_To_NotifySuccess_di" bpmnElement="Flow_To_NotifySuccess">
        <di:waypoint x="725" y="70" />
        <di:waypoint x="775" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_To_EndSuccess_di" bpmnElement="Flow_To_EndSuccess">
        <di:waypoint x="875" y="70" />
        <di:waypoint x="957" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_To_NotifyFailure_di" bpmnElement="Flow_To_NotifyFailure">
        <di:waypoint x="525" y="95" />
        <di:waypoint x="525" y="210" />
        <di:waypoint x="625" y="210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_To_EndFailure_di" bpmnElement="Flow_To_EndFailure">
        <di:waypoint x="725" y="210" />
        <di:waypoint x="807" y="210" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`; 