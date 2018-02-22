"use strict";

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

function buildScheme(fileDir: string, basePath: string): yaml.Schema {
    const IncludeYamlType = new yaml.Type('!include', {
        kind: 'scalar',
        resolve: (data) => true,
        construct: (includePath) => loadConfig(path.resolve(fileDir, includePath), basePath)
    });

    // !include_dir_list will return the content of a directory as a list with each file content being an entry in the list.
    const IncludeDirListYamlType = new yaml.Type('!include_dir_list', {
        kind: 'scalar',
        resolve: (data) => true,
        construct: (includePath) => {
          const incDir = path.resolve(fileDir, includePath)
          return fs.readdirSync(incDir).map(file =>
            loadConfig(path.join(incDir, file), basePath)
          )
        }
    });
    
    const IncludeDirNamedYamlType = new yaml.Type('!include_dir_named', {
        kind: 'scalar',
        resolve: (data) => true,
        construct: (includePath) => {
          const incDir = path.resolve(fileDir, includePath)
          return fs.readdirSync(incDir).reduce((map, file) => {
            const key = file.replace(/\.yaml$/, '')
            map[key] = loadConfig(path.join(incDir, file), basePath)
            return map;
          }, {})
        }
    });
    
    const IncludeDirMergeListYamlType = new yaml.Type('!include_dir_merge_list', {
        kind: 'scalar',
        resolve: (data) => true,
        construct: (includePath) => {
          const incDir = path.resolve(fileDir, includePath)
          return fs.readdirSync(incDir).reduce((list, file) => {
            return list.concat(loadConfig(path.join(incDir, file), basePath))
          }, [])
        }
    });
    
    const IncludeDirMergeNamedType = new yaml.Type('!include_dir_merge_named', {
        kind: 'scalar',
        resolve: (data) => true,
        construct: (includePath) => {
          const incDir = path.resolve(fileDir, includePath)
          return fs.readdirSync(incDir).reduce((map, file) => {
            const sub = loadConfig(path.join(incDir, file), basePath)
            return Object.keys(sub).reduce((map, key) => (map[key] = sub[key], map), map);
          }, {})
        }
    });
    
    const SecretYamlType = new yaml.Type('!secret', {
        kind: 'scalar',
        resolve: (data) => true,
        construct: (key) => loadConfig(path.join(basePath, 'secrets.yaml'), basePath)[key]
    });
    
    const EnvVarYamlType = new yaml.Type('!env_var', {
        kind: 'scalar',
        resolve: (data) => true,
        construct: (key) => ""
    });
    
    // !include_dir_named will return the content of a directory as a dictionary which maps filename => content of file.
    // !include_dir_merge_list will return the content of a directory as a list by merging all files (which should contain a list) into 1 big list.
    // !include_dir_merge_named will return the content of a directory as a dictionary by loading each file and merging it into 1 big dictionary.
    return yaml.Schema.create([
      IncludeYamlType,
      IncludeDirListYamlType,
      IncludeDirNamedYamlType,
      IncludeDirMergeListYamlType,
      IncludeDirMergeNamedType,
      SecretYamlType,
      EnvVarYamlType
    ]);
}
export default function loadConfig(filePath: string, basePath: string = path.dirname(filePath)) : object { 
  const fileDir = path.dirname(filePath);
  const config = fs.readFileSync(filePath, 'utf-8');
  
  var HASS_SCHEMA = buildScheme(fileDir, basePath);
  
  return yaml.safeLoad(config, { schema: HASS_SCHEMA }) || {};
}
