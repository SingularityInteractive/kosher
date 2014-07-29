#Kosher
A node.js tool for generating Gherkin-style BDD tests from JIRA.

## Overview

## Installation

To install globally:
`$ npm install -g kosher`

To install locally:
`$ npm install --save-dev kosher`

## Usage

### JIRA
The recommended pattern for using Kosher is to:

- Add a custom field to JIRA for your Gherkin definitons
- Use Epics to map your features and Stories on those Epics for each Scenario in the feature

Alternatives include:

- Use the description field for your Gherkin definition
- Use Stories for features and Subtasks for scenarios
- Create a custom issue type for features and a custom subtask type for scenarios

The key is that you can use a relationship field (e.g. 'Epic Link' or 'parent') to map scenario issues to feature issues.

### Basic Configuration
To generate a configuration file:
`$ kosher config`

You will be prompted for the following values:

- **JIRA URL** - the full URL for you JIRA server (e.g. 'http://jira.mydomain.com')
- **JIRA Project(s)** - the project(s) in JIRA you want to query issues from (e.g. 'PROJA,PROJB, PROJC')
- **Features Path** - the path that feature files should be generated in (default: 'features/')
- **Feature Issue Type(s)** - the issue type(s) that will house Gherkin feature definitions (e.g: 'Epic,Feature')
- **Feature Field** - the name of the field to pull the Gherkin feature definition from (e.g. 'BDD', 'Acceptance Criteria')
- **Scenario Relationship Field** - the relationship field on scenario issues that links to the feature issue (default: 'Epic Link')
- **Scenario Field** - the name of the field to pull the Gherkin scenario definition from (typically the same as Feature Field)
- **Use Labels as Tags** - Whether labels on issues should be added as tags to the generated features/scenarios
- **Use Components as Tags** - Whether components on issues should be added as tags to the generated features/scenarios
- **Use Versions as Tags** - Whether Fix Versions should be added as tags to the generated features/scenarios
- **Assignee** - Whether the assignee should be added as a tag to the generated features/scenarios

### Syncing
To generate/update Gherkin .feature files:
`$ kosher` or `$ kosher sync`

To sync only a single feature issue and its scenarios:
`$ kosher -i <issueKey>`

### Multiple Configurations
In some cases, you may want to use different configurations in the same project.

To create custom kosher configs:
`$ kosher config -f <file>`

To sync using a custom kosher config:
`$ kosher sync -f <file>`