function Message() {
}
Message.prototype.readAndLogBoolean = function(fieldName) {
  util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+1), this.buf.readInt8(this.position)==1));
  this.position ++;
}
this.readAndLogByte = function(fieldName) {
  util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+1), this.buf.readInt8(this.position)));
  this.position ++;
}
this.readAndLogShort = function(fieldName) {
  util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+2), this.buf.readInt16LE(this.position)));
  this.position += 2;
}
this.readAndLogInt = function(fieldName) {
  util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+4), this.buf.readInt32LE(this.position)));
  this.position += 4;
}
this.readString = function(fieldName) {
  var length = this.buf.readInt16LE(this.position);
  util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+2+length), this.buf.toString('ascii', this.position + is.position+2+length))    );
  this.position += 2;
  this.position += length;
}
this.readAndLogLong = function(fieldName) {
  util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+8), readUInt64(this.buf, this.position)));
  this.position += 8;
}

