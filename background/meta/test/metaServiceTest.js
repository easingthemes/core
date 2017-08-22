var expect = require('chai').expect;
var requirejs = require('requirejs');
var messageBus = require('../../../messagebus/MessageBus.js');
var root = require('../MetaService.js');
var config = require('../MetaConfig.js');

root.srtPlayer.StoreService = require('./StoreMockService.js').srtMock.StoreMockService();

var Descriptor = require('../../../descriptor/Descriptor.js').srtPlayer.Descriptor;

describe('MetaService', ()=> {

    var META_CHANNEL, META_WRITE_CHANNEL, SERVICE_CHANNEL;
    var metaService;

    beforeEach(()=> {
        messageBus.reset();
        SERVICE_CHANNEL = messageBus.channel(Descriptor.CHANNEL.SERVICE);
        META_CHANNEL = messageBus.channel(Descriptor.CHANNEL.META);
        META_WRITE_CHANNEL = messageBus.channel(Descriptor.CHANNEL.META_WRITE);
        metaService = root.srtPlayer.MetaService(messageBus);

    });

    it('publish should notify all subscriber', (done)=>{
        "use strict";
        META_CHANNEL.subscribe({
            topic: 'user.standby',
            callback: (d)=>expect(d).is.equal(false)
        });
        META_CHANNEL.subscribe({
            topic: 'user.play.offsetTime',
            callback: (d)=>expect(d).is.equal(0)
        });
        META_CHANNEL.subscribe({
            topic: 'user.test.deep.prop',
            callback: (d)=> {
                expect(d).is.equal('testTxt');
                done();
            }
        });
        SERVICE_CHANNEL.subscribe({
            topic: Descriptor.SERVICE.META.PUB.READY,
            callback: (d)=> {
                SERVICE_CHANNEL.publish({
                    topic: Descriptor.SERVICE.META.SUB.PUBLISH_ALL,
                    data: 'user'
                });
            }
        });
    });



    it('MetaWriteChannel should publish the updated value to the MetaChannel', (done)=> {
        "use strict";

        META_CHANNEL.subscribe({
            topic: 'user.play.offsetTime',
            callback: (data) => {
                expect(data).to.equal(42);
            }
        });

        META_CHANNEL.subscribe({
            topic: 'user.test.deep.prop',
            callback: (data) => {
                expect(data).to.equal('testChange');
                done();
            }
        });
        SERVICE_CHANNEL.subscribe({
            topic: Descriptor.SERVICE.META.PUB.READY,
            callback: ()=> {
                META_WRITE_CHANNEL.publish({
                    topic: 'user.play.offsetTime',
                    data: 42
                });

                META_WRITE_CHANNEL.publish({
                    topic: 'user.test.deep.prop',
                    data: 'testChange'
                });
            }
        });
    });

    it('should collect fallback values after reset', (done)=> {
        "use strict";

        var callCount = 0;
        META_CHANNEL.subscribe({
            topic: 'user.play.offsetTime',
            callback: (data) => {
                expect(data).to.equal(callCount === 0 ? 42: 0);
                if (callCount === 1) {
                    done();
                }
                callCount++;
            }
        });

        SERVICE_CHANNEL.subscribe({
            topic: Descriptor.SERVICE.META.PUB.READY,
            callback: ()=> {
                META_WRITE_CHANNEL.publish({
                    topic: 'user.play.offsetTime',
                    data: 42
                });

                SERVICE_CHANNEL.publish({
                    topic: Descriptor.SERVICE.META.SUB.RESET,
                    data: 'user'
                });


            }
        });
    });

    it('publish for a given attribute should notify all subscriber (subtitle)', (done)=> {
        "use strict";
        META_CHANNEL.subscribe({
            topic: 'user.test.deep.prop',
            callback: (d)=> {
                expect(d).is.equal('testTxt');
                done();
            }
        });

        SERVICE_CHANNEL.subscribe({
            topic: Descriptor.SERVICE.META.PUB.READY,
            callback: (d)=> {
                SERVICE_CHANNEL.publish({
                    topic: Descriptor.SERVICE.META.SUB.PUBLISH,
                    data: 'user.test.deep.prop'
                });
            }
        });
    });

    it('publish all should notify all subscriber (subtitle)', (done)=> {
        "use strict";
        META_CHANNEL.subscribe({
            topic: 'parsed_subtitle.parsedSubtitle',
            callback: (d)=> {
                expect(d).is.equal('');
                done();
            }
        });

        SERVICE_CHANNEL.subscribe({
            topic: Descriptor.SERVICE.META.PUB.READY,
            callback: (d)=> SERVICE_CHANNEL.publish({
                topic: Descriptor.SERVICE.META.SUB.PUBLISH_ALL,
                data: 'parsed_subtitle'
            })
        });
    });

    it('MetaWriteChannel should publish the updated value to the MetaChannel (subtitle)', (done)=> {
        "use strict";

        META_CHANNEL.subscribe({
            topic: 'parsed_subtitle.parsedSubtitle',
            callback: (data) => {
                expect(data).to.equal('parsedStuff');
                done();
            }
        });
        SERVICE_CHANNEL.subscribe({
            topic: Descriptor.SERVICE.META.PUB.READY,
            callback: ()=> {
                META_WRITE_CHANNEL.publish({
                    topic: 'parsed_subtitle.parsedSubtitle',
                    data: 'parsedStuff'
                });
            }
        });
    });
});



