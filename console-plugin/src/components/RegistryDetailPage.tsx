import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  PageSection,
  Tab,
  Tabs,
  TabTitleText,
  Title,
} from "@patternfly/react-core";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import {
  ResourceEventStream,
  ResourceYAMLEditor,
  Timestamp,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ApicurioRegistry3,
  ApicurioRegistry3Model,
  Condition,
  getReadyCondition,
  getStorageType,
  isAuthEnabled,
} from "../utils/k8s";
import RegistryStatusBadge from "./RegistryStatusBadge";
import EmbeddedRegistryUI from "./EmbeddedRegistryUI";
import "../styles/plugin.css";

const ConditionsTable: React.FC<{ conditions: Condition[] }> = ({
  conditions,
}) => {
  const { t } = useTranslation("plugin__apicurio-registry");

  return (
    <Table variant="compact">
      <Thead>
        <Tr>
          <Th>{t("Type")}</Th>
          <Th>{t("Status")}</Th>
          <Th>{t("Reason")}</Th>
          <Th>{t("Message")}</Th>
          <Th>{t("Last Transition")}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions.map((condition) => (
          <Tr key={condition.type}>
            <Td>{condition.type}</Td>
            <Td>
              <Label
                color={
                  condition.status === "True"
                    ? "green"
                    : condition.status === "False"
                      ? "red"
                      : "grey"
                }
              >
                {condition.status}
              </Label>
            </Td>
            <Td>{condition.reason ?? "-"}</Td>
            <Td>{condition.message ?? "-"}</Td>
            <Td>
              {condition.lastTransitionTime ? (
                <Timestamp timestamp={condition.lastTransitionTime} />
              ) : (
                "-"
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const LabelsDisplay: React.FC<{ labels?: Record<string, string> }> = ({
  labels,
}) => {
  if (!labels || Object.keys(labels).length === 0) return <span>-</span>;
  return (
    <LabelGroup>
      {Object.entries(labels).map(([key, value]) => (
        <Label key={key}>{`${key}=${value}`}</Label>
      ))}
    </LabelGroup>
  );
};

const RegistryDetailPage: React.FC = () => {
  const { t } = useTranslation("plugin__apicurio-registry");
  const { name, ns: namespace } = useParams();
  const [activeTab, setActiveTab] = useState<string | number>("overview");

  const [registry, loaded] = useK8sWatchResource<ApicurioRegistry3>({
    groupVersionKind: {
      group: ApicurioRegistry3Model.apiGroup,
      version: ApicurioRegistry3Model.apiVersion,
      kind: ApicurioRegistry3Model.kind,
    },
    name,
    namespace,
  });

  if (!loaded || !registry) {
    return null;
  }

  const readyCondition = getReadyCondition(registry);
  const conditions = registry.status?.conditions ?? [];

  return (
    <>
      <PageSection variant="light" padding={{ default: "noPadding" }}>
        <div style={{ padding: "1rem 1.5rem 0" }}>
          <Title headingLevel="h1">
            {registry.metadata.name}{" "}
            <RegistryStatusBadge condition={readyCondition} />
          </Title>
        </div>
        <Tabs
          activeKey={activeTab}
          onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
        >
          <Tab
            eventKey="overview"
            title={<TabTitleText>{t("Overview")}</TabTitleText>}
          >
            <PageSection>
              <Grid hasGutter>
                <GridItem span={6}>
                  <Title headingLevel="h2">{t("Details")}</Title>
                  <DescriptionList>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("Name")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {registry.metadata.name}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("Namespace")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {registry.metadata.namespace}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("Labels")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <LabelsDisplay labels={registry.metadata.labels} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("Created")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Timestamp timestamp={registry.metadata.creationTimestamp} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </GridItem>

                <GridItem span={6}>
                  <Title headingLevel="h2">{t("Configuration")}</Title>
                  <DescriptionList>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("Storage")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {getStorageType(registry)}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("Authentication")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {isAuthEnabled(registry) ? t("Enabled") : t("Disabled")}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("Replicas")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {registry.spec?.app?.replicas ?? 1}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("App Ingress")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {registry.spec?.app?.ingress?.host ?? "-"}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("UI Ingress")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {registry.spec?.ui?.ingress?.host ?? "-"}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </GridItem>
              </Grid>

              {conditions.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <Title headingLevel="h2">{t("Conditions")}</Title>
                  <ConditionsTable conditions={conditions} />
                </div>
              )}
            </PageSection>
          </Tab>

          <Tab
            eventKey="yaml"
            title={<TabTitleText>{t("YAML")}</TabTitleText>}
          >
            <ResourceYAMLEditor initialResource={registry} />
          </Tab>

          <Tab
            eventKey="registry-ui"
            title={<TabTitleText>{t("Registry UI")}</TabTitleText>}
          >
            <EmbeddedRegistryUI registry={registry} />
          </Tab>

          <Tab
            eventKey="events"
            title={<TabTitleText>{t("Events")}</TabTitleText>}
          >
            <PageSection>
              <ResourceEventStream resource={registry} />
            </PageSection>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export default RegistryDetailPage;
