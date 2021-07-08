---
layout: post
title: Building a Memcache module for your site (Part 2)
excerpt: Presumably, you've followed the
  steps [here](http://perrymitchell.net/article/building_memcache_modu...
date: 2013-06-13
updatedDate: 2013-06-13
tags:
  - post
  - memcached
---

Presumably, you've followed the steps [here](http://perrymitchell.net/article/building_memcache_module_part_1) to setup Memcache on your server, or already have it running. This article will walk you through creating a handy little helper class to provide a simple interface for interacting with the cache.

## Preparation

You'll want to include all of the Memcache code we use here somewhere where it's accessible in every script, if you're using it extensively. When we write the class in the next section, placement of it should be carefully considered. Prior to that though, we need to set up some configuration.

There are a few settings we should define using constants, such as:

```
	define("MEMCACHE_SERVER",	"localhost");
	define("MEMCACHE_PORT",		11211);
	define("MEMCACHE_EXPIRY",	3600); // 1 hour
```

Feel free to use different values if they better suit your needs. The first 2 items are just for the server, and probably won't change unless you're hosing the memcache server elsewhere. The MEMCACHE_EXPIRY is the number of seconds to keep an item in the cache before it expires.

## The Class

Building a class means we can contain any functionality we implement in one convenient object. We'll also make it a singleton (found it to be best described [here](http://www.talkphp.com/advanced-php-programming/1304-how-use-singleton-design-pattern.html)), so we don't end up creating heaps of these throughout the execution of your site. I'm going to go ahead and list the whole class first, and I'll describe each bit afterwards:

```
<?php
	class MemcacheAgent {

		protected $cache;
		protected $connected;
		protected $memcache_available;

		private static $m_pInstance;

		private function __construct($server, $port) {
			if (class_exists('Memcache')) {
				$this->cache = new Memcache;
				$this->connected = $this->cache->connect($server, $port);
				$this->memcache_available = true;
			} else {
				$this->cache = false;
				$this->connected = false;
				$this->memcache_available = false;
			}
			return $this->connected;
		}

		public static function getInstance() {
			if (!self::$m_pInstance) { 
				self::$m_pInstance = new MemcacheAgent(MEMCACHE_SERVER, MEMCACHE_PORT); 
			}
			return self::$m_pInstance; 
		}

		public function get($key) {
			$value = false;
			if ($this->connected) {
				$value = $this->cache->get($key);
			}
			return $value;
		}

		public function getCache() {
			return $this->cache;
		}

		public function isAvailable() {
			return $this->memcache_available;
		}

		public function isConnected() {
			return $this->connected;
		}

		public function keyExists($key) {
			$exists = false;
			if ($this->connected) {
				$item = $this->cache->get($key);
				if ($item !== false) $exists = true;
			}
			return $exists;
		}

		public function set($key, $value, $expiry=MEMCACHE_EXPIRY) {
			if ($this->connected) {
				$this->cache->set($key, $value, 0, $expiry);
			}
		}

	}
```

So the class has a couple of properties to start with. The first, **$cache**, is the instance of the actual memcache object the class wraps. This is set when the class initiates.

**$connected** is a boolean, which holds whether or not the cache is connected.

**$memcache_available** is also a boolean, holding whether or not memcache is actually available.

The next property, **$m_pInstance**, is for the singleton pattern. This static item holds the actual single instance of the MemcacheAgent object when it's created, ensuring that only one instance can ever exist. It must be private and static.

## The Constructor

```
	private function __construct($server, $port) {
		if (class_exists('Memcache')) {
			$this->cache = new Memcache;
			$this->connected = $this->cache->connect($server, $port);
			$this->memcache_available = true;
		} else {
			$this->cache = false;
			$this->connected = false;
			$this->memcache_available = false;
		}
		return $this->connected;
	}
```

The constructor is declared private - This is also due to the fact that it is a singleton. The constructor will only ever get called once by the **getInstance()** function. This will be discussed further later.

The constructor simply detects whether or not the **Memcache** class exists, and if it does, creates a Memcache object and points it to the local server. The connection is also established at this stage.

## The Singleton Instance

Instead of calling the constructor to get the instance, like you **would** have otherwise done:
`$agent = new MemcacheAgent(MEMCACHE_SERVER, MEMCACHE_PORT);`

You'll want to call the getInstance() function instead:
`$agent = MemcacheAgent::getInstance();`

This will always provide the MemcacheAgent to you, and always the same copy.

## Using the Cache

The rest of the functions provide an interface to now use the cache. I'll describe them below:

The **get($key)** function returns the value for a key stored in memcache, or false if the key wasn't found. If false isn't the ideal value for your situation, just simply change it to something else (like **null** for instance) in this function.

The **getCache()** function returns the original memcache object, which is part of the PHP library. Alternatively to writing a class, you could bounce commands right off of this - But the idea here is to write a nice, easy-to-use wrapper, so we keep it hidden. Providing this function is just another way to get to the cache if we need to.

**isAvailable()** and **isConnected()** return whether the memcache object is available, and whether or not the cache is connected, respectively. Both of these are boolean.

**keyExists($key)** tests for a key in the cache. This function returns boolean true if the key was found, or false if it wasn't.

The most important function here is the **set($key, $value, $expiry)** function. This one does all the work, setting the data in the cache. The $key is like the slug or identifier for your value, the value is what you're storing against that key, and the $expiry is the number of seconds to keep this value for. Memcache will count down after having a value set, until the expiry duration is reached - It will then clear the stored value. If a value is _touched_ during that time, the expiry counter is reset. In this class, I've defaulted it to the value in MEMCACHE_EXPIRY, which is 1 hour.

## Example Usage

### Example 1: Writing and Reading

In the following example, we'll write a couple of values, then read them back:

```
$agent = MemcacheAgent::getInstance();

$agent->set("item", "some value"); // sets for 1 hour (default)

$agent->set("another", "another value", 300); // sets for 5 minutes

sleep(1); // wait a second, simulating other script processing

if ($agent->keyExists("item")) {
	echo $agent->get("item"); // displays "some value"
}

$agent->set("another", "changed value"); // value changed, time now 1 hour

if ($agent->keyExists("another")) {
	echo $agent->get("another"); // displays "changed value"
}
```

Here I've set only 2 values, changed the second value, and displayed both of them. It should be quite easy to follow as to what happens.

The agent, defined at the top, is set to an instance of the MemcacheAgent. If no instance existed, it would have been created at this step. If one had already been created, this would have been returned.

### Example 2: Dynamic Keys

In this example, I'll create 20 keys and values dynamically, and read them back.

```
$agent = MemcacheAgent::getInstance();

for ($i = 0; $i < 20; $i++) {
	$agent->set("key_" . $i, "some value for " . $i);
}

sleep(1);

for ($i = 0; $i < 20; $i++) {
	echo "Item: " . $agent->get("key_" . $i) . "\n";
}
```

Pretty straight forward? It is indeed, and damn quick!

## Conclusion

You may notice in benchmarking that there's some overhead in the initial connection to the Memcache server. This is fine, most of the time, seeing as we're using a singleton (ie. it'll only connect once per execution).