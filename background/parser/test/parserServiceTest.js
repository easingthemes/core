var expect = require('chai').expect;
var requirejs = require('requirejs');
var messageBus = require('../../../messagebus/MessageBus.js');
var root = require('../ParserService.js');
root.srtPlayer.SRTParser = require('./SrtParserMock.js').srtMock.SRTParserMock;
var Descriptor = require('../../../descriptor/Descriptor.js').srtPlayer.Descriptor;


describe('ParserService', ()=> {

    var META_CHANNEL, META_WRITE_CHANNEL, SERVICE_CHANNEL;
    var parserService;
    beforeEach(()=>{
        messageBus.reset();
        SERVICE_CHANNEL = messageBus.channel(Descriptor.CHANNEL.SERVICE);
        META_WRITE_CHANNEL = messageBus.channel(Descriptor.CHANNEL.META_WRITE);
        parserService = root.srtPlayer.ParserService(messageBus);
    });

    it('should notify the metaWriteChannel when subtitle was parsed', (done)=> {
        META_WRITE_CHANNEL.subscribe({
            topic: 'parsed_subtitle.parsedSubtitle',
            callback: (d)=>{
                "use strict";
                expect(JSON.parse(d).length).to.equal(3);
            }
        });

        META_WRITE_CHANNEL.subscribe({
            topic: 'parsed_subtitle.isParsed',
            callback: (d)=>{
                "use strict";
                expect(d).to.equal(true);
                done();
            }
        });


        SERVICE_CHANNEL.publish({
            topic: root.srtPlayer.Descriptor.SERVICE.PARSER.SUB.PARSE,
            data:{
                type:'srt',
                raw:'rawSrtData'
            }
        });
    });
});