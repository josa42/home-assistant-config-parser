import { join } from 'path';
import { expect } from 'chai';

import loadConfig from '../lib/load-config';

function fixture(name: string): string {
  return join(__dirname, 'fixtures', name, 'configuration.yaml')
}

describe('loadConfig()', () => {
  it('should load empty configuration', () => {
    const result = loadConfig(fixture('empty'));
    
    expect(result).to.be.deep.equal({})
  });
  
  it('should load configuration with !include', () => {
    const result = loadConfig(fixture('include-basic'));
    expect(result).to.be.deep.equal({ file: {}})
  });

  // !include_dir_list will return the content of a directory as a list with each file content being an entry in the list.
  it('should load configuration with !include_dir_list', () => {
    const result = loadConfig(fixture('include-dir-list'));
    expect(result).to.be.deep.equal({ test: [{ a: 'a' }, { b: 'b' }] })
  });
  
  // // !include_dir_named will return the content of a directory as a dictionary which maps filename => content of file.
  it('should load configuration with !include_dir_named', () => {
    const result = loadConfig(fixture('include-dir-named'));
    expect(result).to.be.deep.equal({ test: { a: 'a', b: 'b' } })
  });

  // !include_dir_merge_list will return the content of a directory as a list by merging all files (which should contain a list) into 1 big list.
  it('should load configuration with !include_dir_merge_list', () => {
    const result = loadConfig(fixture('include-dir-merge-list'));
    expect(result).to.be.deep.equal({ test: [{ a: 'a' }, { b: 'b' }] })
  });

  // !include_dir_merge_named will return the content of a directory as a dictionary by loading each file and merging it into 1 big dictionary.
  it('should load configuration with !include_dir_merge_named', () => {
    const result = loadConfig(fixture('include-dir-merge-named'));
    expect(result).to.be.deep.equal({ test: { a: 'a', b: 'b'} })
  });
 
  // !include_dir_merge_named will return the content of a directory as a dictionary by loading each file and merging it into 1 big dictionary.
  it('should load configuration with !secret', () => {
    const result = loadConfig(fixture('secret'));
    expect(result).to.be.deep.equal({ test: 'mysecret' })
  });

  it('should load configuration with !env_var', () => {
    const result = loadConfig(fixture('env_var'));
    expect(result).to.be.deep.equal({ test: '' })
  });
});